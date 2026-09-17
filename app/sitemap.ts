import type { MetadataRoute } from 'next'
import { PAGES, SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return Object.values(PAGES).map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: page.path === '/' ? 1 : 0.8,
  }))
}
