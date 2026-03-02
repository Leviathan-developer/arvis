import type { MetadataRoute } from 'next';
import { DOCS_LIST } from './docs/[slug]/page';

const BASE = 'https://arvisagent.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/docs`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    ...DOCS_LIST.map((doc) => ({
      url: `${BASE}/docs/${doc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
