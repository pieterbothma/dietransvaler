import { notFound } from 'next/navigation'
import { getAlleSlugs, getArtikelBySlug } from '@/lib/inhoud'
import { ogKaart, OG_GROOTTE, OG_TIPE } from '@/lib/og'

export const alt = 'Die Transvaler'
export const size = OG_GROOTTE
export const contentType = OG_TIPE

export async function generateStaticParams() {
  const slugs = await getAlleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artikel = await getArtikelBySlug(slug)
  if (!artikel) notFound()
  return ogKaart(artikel)
}
