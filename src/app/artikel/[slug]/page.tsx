import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArtikelInhoud } from '@/components/artikel-inhoud'
import { KategorieMerker } from '@/components/kategorie-merker'
import { skrywerPortret } from '@/lib/skrywers'
import { getAlleSlugs, getArtikelBySlug } from '@/lib/inhoud'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAlleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artikel = await getArtikelBySlug(slug)
  if (!artikel) return {}

  return {
    title: artikel.titel,
    description: artikel.uittreksel,
    openGraph: {
      title: artikel.titel,
      description: artikel.uittreksel,
      siteName: 'Die Transvaler — fopnuus wat jy kan vertrou',
      type: 'article',
      url: `/artikel/${artikel.slug}`,
      images: artikel.prent ? [artikel.prent] : undefined,
    },
  }
}

export default async function ArtikelBladsy({ params }: Props) {
  const { slug } = await params
  const artikel = await getArtikelBySlug(slug)
  if (!artikel) notFound()

  const portret = skrywerPortret(artikel.skrywer)

  return (
    <article className="mx-auto max-w-2xl">
      <KategorieMerker kategorie={artikel.kategorie} />

      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">
        {artikel.titel}
      </h1>

      <p className="mt-4 text-lg text-muted-foreground">{artikel.uittreksel}</p>

      <div className="mt-5 flex items-center gap-3">
        {portret && (
          <Image
            src={portret}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border object-cover grayscale"
          />
        )}
        <p className="text-sm text-muted-foreground">
          {artikel.skrywer} ·{' '}
          <time dateTime={artikel.datum}>
            {new Date(artikel.datum).toLocaleDateString('af-ZA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </p>
      </div>

      {artikel.prent && (
        <figure className="mt-8">
          <Image
            src={artikel.prent}
            alt={artikel.prentAlt ?? ''}
            width={1200}
            height={675}
            className="w-full rounded-sm border"
            priority
          />
          {artikel.prentBronskrif && (
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {artikel.prentBronskrif}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-8">
        <ArtikelInhoud inhoud={artikel.inhoud} />
      </div>

    </article>
  )
}
