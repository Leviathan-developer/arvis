import { NextRequest, NextResponse } from 'next/server';

// Optional rate limiting — only active if Upstash env vars are set
let ratelimit: { limit: (ip: string) => Promise<{ success: boolean; reset: number }> } | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Dynamic import pattern — only load if env vars exist
    const { Redis } = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
    });
  }
} catch {
  // Upstash not available — rate limiting disabled
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit (if configured)
    if (ratelimit) {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor?.split(',')[0] ?? 'anonymous';
      const { success, reset } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        );
      }
    }

    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Call Resend API if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      const res = await fetch('https://api.resend.com/audiences/' + process.env.RESEND_AUDIENCE_ID + '/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          unsubscribed: false,
        }),
      });

      // 409 = already exists — treat as success
      if (!res.ok && res.status !== 409) {
        const body = await res.text();
        console.error('Resend API error:', res.status, body);
        return NextResponse.json(
          { error: 'Failed to subscribe. Please try again.' },
          { status: 502 }
        );
      }
    } else {
      // No Resend configured — log for dev
      console.log('[subscribe] No RESEND_API_KEY/RESEND_AUDIENCE_ID — email captured:', normalizedEmail);
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
