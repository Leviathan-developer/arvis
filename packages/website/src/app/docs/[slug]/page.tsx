import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

const DOCS_DIR = path.join(process.cwd(), '..', '..', 'docs');

export const DOCS_LIST = [
  { slug: '00-user-guide',      num: '00', title: 'User Guide',       tag: 'Start here', tagColor: '#8B5CF6' },
  { slug: '01-architecture',    num: '01', title: 'Architecture',     tag: null, tagColor: null },
  { slug: '02-message-flow',    num: '02', title: 'Message Flow',     tag: null, tagColor: null },
  { slug: '03-routing',         num: '03', title: 'Routing',          tag: null, tagColor: null },
  { slug: '04-llm-providers',   num: '04', title: 'LLM Providers',    tag: null, tagColor: null },
  { slug: '05-context-memory',  num: '05', title: 'Context & Memory', tag: null, tagColor: null },
  { slug: '06-queue-scheduler', num: '06', title: 'Queue & Scheduler',tag: null, tagColor: null },
  { slug: '07-security',        num: '07', title: 'Security',         tag: null, tagColor: null },
  { slug: '08-extensibility',   num: '08', title: 'Extensibility',    tag: null, tagColor: null },
  { slug: '09-connectors',      num: '09', title: 'Connectors',       tag: null, tagColor: null },
  { slug: '10-troubleshooting', num: '10', title: 'Troubleshooting',  tag: null, tagColor: null },
  { slug: '11-deployment',      num: '11', title: 'Deployment',       tag: 'VPS guide', tagColor: '#f59e0b' },
  { slug: '12-api-reference',   num: '12', title: 'API Reference',    tag: 'API', tagColor: '#22c55e' },
];

export async function generateStaticParams() {
  return DOCS_LIST.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOCS_LIST.find((d) => d.slug === slug);
  if (!doc) return { title: 'Docs' };
  return {
    title: `${doc.title} — Docs`,
    description: `Arvis documentation: ${doc.title}`,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(DOCS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) notFound();

  const content = fs.readFileSync(filePath, 'utf-8');
  const html = await marked(content, { gfm: true });

  const currentIdx = DOCS_LIST.findIndex((d) => d.slug === slug);
  const prevDoc = currentIdx > 0 ? DOCS_LIST[currentIdx - 1] : null;
  const nextDoc = currentIdx < DOCS_LIST.length - 1 ? DOCS_LIST[currentIdx + 1] : null;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          display: 'flex',
          padding: '0 24px',
          gap: 0,
        }}
      >
        {/* ── Sidebar ── */}
        <aside
          className="docs-sidebar"
          style={{
            width: 228,
            flexShrink: 0,
            paddingTop: 44,
            paddingRight: 28,
            position: 'sticky',
            top: 72,
            alignSelf: 'flex-start',
            height: 'calc(100vh - 72px)',
            overflowY: 'auto',
          }}
        >
          <Link
            href="/docs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#3f3f46',
              textDecoration: 'none',
              marginBottom: 20,
              transition: 'color 0.15s',
            }}
          >
            ← All docs
          </Link>

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#2d2d35',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            Documentation
          </p>

          {DOCS_LIST.map((doc) => {
            const active = doc.slug === slug;
            return (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className="docs-nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 10px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#a78bfa' : '#52525e',
                  background: active ? 'rgba(139,92,246,0.1)' : 'transparent',
                  marginBottom: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    color: active ? '#6d28d9' : '#2d2d35',
                    flexShrink: 0,
                    width: 18,
                  }}
                >
                  {doc.num}
                </span>
                {doc.title}
              </Link>
            );
          })}
        </aside>

        {/* ── Content ── */}
        <main
          className="docs-content"
          style={{
            flex: 1,
            minWidth: 0,
            paddingTop: 44,
            paddingBottom: 96,
            paddingLeft: 44,
            borderLeft: '1px solid #1a1a1f',
          }}
        >
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Prev / Next */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 72,
              paddingTop: 28,
              borderTop: '1px solid #1a1a1f',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {prevDoc ? (
              <Link
                href={`/docs/${prevDoc.slug}`}
                style={{
                  textDecoration: 'none',
                  color: '#52525e',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 0.15s',
                }}
              >
                ← {prevDoc.title}
              </Link>
            ) : (
              <span />
            )}
            {nextDoc ? (
              <Link
                href={`/docs/${nextDoc.slug}`}
                style={{
                  textDecoration: 'none',
                  color: '#52525e',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 0.15s',
                  marginLeft: 'auto',
                }}
              >
                {nextDoc.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
