import type { MetadataRoute } from 'next'
import { OORSPRONG } from '@/lib/konfig'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${OORSPRONG}/sitemap.xml`,
  }
}
