import type { MetadataRoute } from 'next'
import { getAlleArtikels, KATEGORIEE } from '@/lib/inhoud'

const OORSPRONG = 'https://dietransvaler.co.za'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artikels = await getAlleArtikels()

  return [
    { url: OORSPRONG, changeFrequency: 'daily', priority: 1 },
    { url: `${OORSPRONG}/oor-ons`, changeFrequency: 'yearly', priority: 0.3 },
    ...KATEGORIEE.map((k) => ({
      url: `${OORSPRONG}/kategorie/${k.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
    ...artikels.map((a) => ({
      url: `${OORSPRONG}/artikel/${a.slug}`,
      lastModified: new Date(a.datum),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
