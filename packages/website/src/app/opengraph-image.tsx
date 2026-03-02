import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'arvis — Self-hosted AI agent platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(139,92,246,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Purple glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 65%)',
          }}
        />

        {/* Purple glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -200,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 65%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: '#8B5CF6',
            letterSpacing: '-0.04em',
            marginBottom: 20,
            display: 'flex',
          }}
        >
          {'>_<'}&nbsp;arvis
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#9494a0',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            maxWidth: 680,
            textAlign: 'center',
            lineHeight: 1.45,
            display: 'flex',
          }}
        >
          Self-hosted AI agent platform
        </div>

        {/* Platform pills */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 32,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Discord', 'Telegram', 'Slack', 'WhatsApp', 'Web'].map((p) => (
            <div
              key={p}
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 999,
                padding: '6px 16px',
                fontSize: 15,
                color: '#a78bfa',
                display: 'flex',
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 15,
            color: '#2d2d35',
            letterSpacing: '0.06em',
          }}
        >
          arvisagent.com
        </div>
      </div>
    ),
    { ...size }
  );
}
