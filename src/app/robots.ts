import type { MetadataRoute } from 'next'
import { SITE_URL as BASE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /r/* は QR の実リダイレクト、/dashboard は管理画面、/api は内部用
        disallow: ['/api/', '/dashboard/', '/r/', '/payment/', '/expired'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
