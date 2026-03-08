import { NextRequest, NextResponse } from 'next/server';

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Uses Upstash Redis if configured, otherwise falls back to in-memory rate limiting.
// Either way, the endpoint is ALWAYS protected.

interface RateLimiter {
  limit: (ip: string) => Promise<{ success: boolean; reset: number }>;
}

let ratelimit: RateLimiter | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
    });
  }
} catch {
  // Upstash not available — will use in-memory fallback
}

// In-memory fallback: simple sliding window (survives within a single serverless invocation)
const ipHits = new Map<string, number[]>();
function memoryRateLimit(ip: string, maxReqs = 3, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter(t => t > now - windowMs);
  if (hits.length >= maxReqs) return false;
  hits.push(now);
  ipHits.set(ip, hits);
  // Cleanup old IPs every 100 entries
  if (ipHits.size > 100) {
    for (const [k, v] of ipHits) {
      if (v.every(t => t < now - windowMs)) ipHits.delete(k);
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() ?? 'anonymous';

    // Rate limit — Upstash or in-memory fallback
    if (ratelimit) {
      const { success, reset } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } },
        );
      }
    } else if (!memoryRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 320) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Call Resend API if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      const res = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          audience_id: process.env.RESEND_AUDIENCE_ID,
          unsubscribed: false,
        }),
      });

      // 409 = already exists — treat as success
      if (!res.ok && res.status !== 409) {
        const body = await res.text();
        console.error('Resend API error:', res.status, body);
        return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 502 });
      }
    } else {
      console.log('[subscribe] No RESEND_API_KEY/RESEND_AUDIENCE_ID — email captured:', normalizedEmail);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
