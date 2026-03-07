import { spawn } from 'child_process';
import type { RunRequest, RunResult } from './types.js';
import { estimateTokens } from '../lib/token-utils.js';
import { createLogger } from '../logger.js';

const log = createLogger('cli-runner');

/**
 * Executes Claude via the CLI subprocess.
 *
 * Stateless design: Arvis owns all conversation history (DB-backed).
 * Each CLI invocation gets a fresh, self-contained prompt with full context.
 * No session persistence — no session files on disk, no folder sprawl.
 *
 * System prompt piped via stdin (avoids Windows command-line length limits).
 */
export class CLIRunner {
  async execute(request: RunRequest): Promise<RunResult> {
    const cwd = request.projectPath || request.agent.projectPath || process.cwd();

    // Build the full prompt with system instructions embedded
    let fullPrompt = request.prompt;
    if (request.systemPrompt) {
      fullPrompt = `<instructions>\n${request.systemPrompt}\n</instructions>\n\nRespond to the following. You MUST follow all instructions above, especially any action tag formats.\n\n${request.prompt}`;
    }

    const args = [
      '--print',
      '--no-session-persistence',  // Arvis manages history — don't save CLI sessions to disk
      '--model', request.model || request.agent.model || 'claude-sonnet-4-6',
      '--max-turns', String(request.maxTurns || 25),
    ];

    // Tool restrictions — map Arvis tool names to Claude Code CLI built-in names
    const ARVIS_TO_CLI: Record<string, string[]> = {
      http_fetch:    ['WebFetch'],
      web_search:    ['WebSearch'],
      run_shell:     ['Bash'],
      read_file:     ['Read'],
      write_file:    ['Write', 'Edit'],
      write_plugin:  ['Write', 'Edit'],
      list_plugins:  [],
      delete_plugin: [],
      get_time:      [],
      calculate:     [],
    };
    const tools = request.allowedTools || request.agent.allowedTools;
    if (tools?.length) {
      const cliTools = new Set<string>();
      for (const tool of tools) {
        const mapped = ARVIS_TO_CLI[tool];
        if (mapped) {
          mapped.forEach(t => { if (t) cliTools.add(t); });
        } else {
          cliTools.add(tool); // pass through unknown tools unchanged
        }
      }
      for (const t of cliTools) {
        args.push('--allowedTools', t);
      }
    }

    const env: Record<string, string | undefined> = { ...process.env };
    if (request.account?.homeDir) {
      env.HOME = request.account.homeDir;
      env.USERPROFILE = request.account.homeDir;
    }
    delete env.CLAUDECODE;

    const startTime = Date.now();

    // ── Docker sandbox ────────────────────────────────────────────────────────
    let spawnCmd: string;
    let spawnArgs: string[];

    if (request.sandbox === 'docker') {
      const image = process.env.ARVIS_SANDBOX_IMAGE || 'arvis-sandbox:latest';
      const homeDir = request.account?.homeDir || process.env.HOME || process.env.USERPROFILE || '/root';
      spawnCmd = 'docker';
      spawnArgs = [
        'run', '--rm', '-i',
        '--network', 'none',
        '--cpus', '1',
        '--memory', '512m',
        '--mount', `type=bind,source=${cwd},target=/workspace,readonly=false`,
        '--mount', `type=bind,source=${homeDir},target=/home/claude,readonly=true`,
        '--env', `HOME=/home/claude`,
        '--workdir', '/workspace',
        image,
        'claude', ...args,
      ];
      log.info({ image, cwd }, 'Starting CLI in Docker sandbox');
    } else {
      spawnCmd = 'claude';
      spawnArgs = args;
    }

    return new Promise((resolve, reject) => {
      log.info({ promptLen: fullPrompt.length, cwd, sandbox: request.sandbox || 'none' }, 'Starting CLI');

      const child = spawn(spawnCmd, spawnArgs, {
        cwd,
        env: env as NodeJS.ProcessEnv,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      const timeout = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
        reject(new Error('Claude CLI timed out after 180s'));
      }, 180_000);

      child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

      // Pipe full prompt via stdin
      child.stdin.on('error', () => { /* stdin may close early if process exits — ignore */ });
      child.stdin.write(fullPrompt);
      child.stdin.end();

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (killed) return;

        const durationMs = Date.now() - startTime;
        log.info({ code, durationMs, stdoutLen: stdout.length, stderrLen: stderr.length }, 'CLI exited');

        if (stderr) {
          log.warn({ stderr: stderr.substring(0, 500) }, 'CLI stderr');
        }

        if (code !== 0 && !stdout) {
          log.error({ code, stderr: stderr.substring(0, 500) }, 'CLI failed');
          reject(new Error(`CLI exit ${code}: ${stderr}`));
          return;
        }

        log.debug({ output: stdout.substring(0, 500) }, 'CLI output preview');

        const estimatedTokens = estimateTokens(stdout);
        resolve({
          content: stdout.trim(),
          model: request.model || request.agent.model,
          provider: (request.account?.provider || 'anthropic') as RunResult['provider'],
          inputTokens: 0,
          outputTokens: estimatedTokens,
          tokensUsed: estimatedTokens,
          costUsd: 0, // CLI subscription — no per-request cost
          mode: 'full',
          sessionId: undefined,
          durationMs,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start CLI: ${err.message}`));
      });
    });
  }
}
