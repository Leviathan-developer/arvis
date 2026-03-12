import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import type { MessageBus } from '@arvis/core';
import type { IncomingMessage, OutgoingMessage, Attachment } from '@arvis/core';

interface WebClient {
  ws: WebSocket;
  userId: string;
  userName: string;
  channelId: string;
}

/**
 * HTTP + WebSocket connector for the web dashboard.
 * Provides REST API for management and WebSocket for real-time chat.
 */
export class WebConnector {
  private server: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebClient> = new Map();
  private allowedOrigins: string[];

  constructor(
    private bus: MessageBus,
    private config: { port: number; apiKey?: string; allowedOrigins?: string[] },
  ) {
    // Default: localhost on any port. Override via config.allowedOrigins.
    this.allowedOrigins = config.allowedOrigins?.length
      ? config.allowedOrigins
      : ['http://localhost', 'https://localhost', 'http://127.0.0.1', 'https://127.0.0.1'];
  }

  /** Start the web connector */
  async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      this.handleHttp(req, res);
    });

    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // Listen for outgoing messages destined for web platform
    this.bus.on('send', (msg) => {
      if (msg.platform !== 'web') return;
      this.sendToWeb(msg);
    });

    this.bus.on('typing', (data) => {
      if (data.platform !== 'web') return;
      this.broadcastToChannel(data.channelId, {
        type: 'typing',
        channelId: data.channelId,
      });
    });

    return new Promise((resolve) => {
      this.server!.listen(this.config.port, () => {
        resolve();
      });
    });
  }

  /** Stop the connector */
  async stop(): Promise<void> {
    for (const client of this.clients.values()) {
      client.ws.close();
    }
    this.clients.clear();

    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          if (this.server) {
            this.server.close(() => resolve());
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /** Handle HTTP requests (REST API + CORS) */
  private handleHttp(req: http.IncomingMessage, res: http.ServerResponse): void {
    // CORS — restrict to allowed origins
    const origin = req.headers.origin || '';
    const isAllowed = this.allowedOrigins.some(o => origin === o || origin.startsWith(o + ':'));
    res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : this.allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // API key validation for REST endpoints (timing-safe)
    if (this.config.apiKey) {
      const auth = req.headers.authorization;
      const provided = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!provided || !this.timingSafeCompare(provided, this.config.apiKey)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', clients: this.clients.size }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/message') {
      this.handleRestMessage(req, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  /** Handle REST message endpoint (for integrations that don't use WebSocket) */
  private handleRestMessage(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body) as {
          content: string;
          userId: string;
          userName: string;
          channelId: string;
        };

        const msg: IncomingMessage = {
          id: crypto.randomUUID(),
          platform: 'web',
          channelId: data.channelId,
          userId: data.userId,
          userName: data.userName,
          content: data.content,
          metadata: { source: 'rest' },
          timestamp: new Date(),
        };

        this.bus.emit('message', msg);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, messageId: msg.id }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  /** Handle new WebSocket connection */
  private handleConnection(ws: WebSocket, req: http.IncomingMessage): void {
    const clientId = crypto.randomUUID();

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // Auth message — registers the client
        if (data.type === 'auth') {
          // If API key is configured, require it in auth message
          if (this.config.apiKey) {
            const provided = String(data.apiKey || '');
            if (!provided || !this.timingSafeCompare(provided, this.config.apiKey)) {
              ws.send(JSON.stringify({ type: 'error', error: 'Invalid or missing API key' }));
              ws.close(4001, 'Unauthorized');
              return;
            }
          }

          const client: WebClient = {
            ws,
            userId: data.userId || clientId,
            userName: data.userName || 'Web User',
            channelId: data.channelId || 'web-default',
          };
          this.clients.set(clientId, client);

          ws.send(JSON.stringify({ type: 'auth_ok', clientId }));
          return;
        }

        // Chat message
        if (data.type === 'message') {
          const client = this.clients.get(clientId);
          if (!client) {
            ws.send(JSON.stringify({ type: 'error', error: 'Not authenticated. Send auth message first.' }));
            return;
          }

          // Process file attachments
          let attachments: Attachment[] | undefined;
          if (data.attachments && Array.isArray(data.attachments)) {
            attachments = [];
            const uploadDir = path.join(process.cwd(), 'data', 'uploads', client.channelId);
            fs.mkdirSync(uploadDir, { recursive: true });

            for (const att of data.attachments) {
              if (!att.data || !att.filename) continue;
              const safeName = path.basename(att.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
              const filename = `${Date.now()}-${safeName}`;
              const filePath = path.join(uploadDir, filename);
              const buf = Buffer.from(att.data, 'base64');
              fs.writeFileSync(filePath, buf);
              attachments.push({
                id: crypto.randomUUID(),
                filename: att.filename,
                url: filePath,
                contentType: att.contentType || 'application/octet-stream',
                data: att.contentType?.startsWith('image/') ? att.data : undefined,
              });
            }
          }

          const msgId = crypto.randomUUID();
          const msg: IncomingMessage = {
            id: msgId,
            platform: 'web',
            channelId: client.channelId,
            userId: client.userId,
            userName: client.userName,
            content: data.content,
            attachments,
            metadata: { source: 'websocket', isDM: true },
            timestamp: new Date(),
          };

          // Send ACK back to client
          ws.send(JSON.stringify({ type: 'ack', messageId: msgId }));

          this.bus.emit('message', msg);
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  /** Send an outgoing message to web clients */
  private sendToWeb(msg: OutgoingMessage): void {
    const payload = {
      type: 'message',
      channelId: msg.channelId,
      content: msg.content,
      embeds: msg.embeds,
      buttons: msg.buttons,
      files: msg.files?.map(f => ({
        name: f.name,
        contentType: f.contentType,
        data: typeof f.data === 'string' ? f.data : Buffer.from(f.data).toString('base64'),
      })),
      replyTo: msg.replyTo,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToChannel(msg.channelId, payload);
  }

  /** Broadcast a payload to all clients in a channel */
  private broadcastToChannel(channelId: string, payload: unknown): void {
    const data = JSON.stringify(payload);
    for (const client of this.clients.values()) {
      if (client.channelId === channelId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  /** Timing-safe string comparison to prevent timing attacks */
  private timingSafeCompare(a: string, b: string): boolean {
    const pad = (s: string) => s.padEnd(Math.max(a.length, b.length, 1), '\0');
    const bufA = Buffer.from(pad(a));
    const bufB = Buffer.from(pad(b));
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  }
}
