import type { MetadataRoute } from 'next'
import { CASE_STUDIES } from '@/lib/cases'
import { SITE_URL as BASE } from '@/lib/site'

/**
 * 検索エンジンに渡す地図。
 * /lp/* は広告・SNS からの着地専用で、内容が /cases/* と重なるため意図的に載せない
 * （同じキーワードで2ページが競合するのを避ける）。
 * /dashboard・/r/* は非公開なので当然除外。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, freq: 'weekly' },
    { path: '/cases', priority: 0.9, freq: 'weekly' },
    { path: '/biz/tourism', priority: 0.9, freq: 'monthly' },
    { path: '/demo', priority: 0.7, freq: 'monthly' },
    { path: '/affiliate', priority: 0.6, freq: 'monthly' },
    { path: '/contact', priority: 0.5, freq: 'yearly' },
    { path: '/terms', priority: 0.3, freq: 'yearly' },
    { path: '/privacy', priority: 0.3, freq: 'yearly' },
    { path: '/tokusho', priority: 0.3, freq: 'yearly' },
  ]

  const now = new Date()

  return [
    ...staticPages.map(p => ({
      url: `${BASE}${p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    ...CASE_STUDIES.map(c => ({
      url: `${BASE}/cases/${c.slug}`,
      lastModified: c.publishedAt ? new Date(c.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
