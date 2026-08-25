import Image from 'next/image'
import Link from 'next/link'
import { KategorieMerker } from '@/components/kategorie-merker'
import type { ArtikelMeta } from '@/lib/inhoud'

export function ArtikelKaart({ artikel }: { artikel: ArtikelMeta }) {
  return (
    <article className="kaart-hyser group border-t pt-5">
      <Link
        href={`/artikel/${artikel.slug}`}
        className="mb-4 block overflow-hidden rounded-sm"
      >
        {artikel.prent && (
          <Image
            src={artikel.prent}
            alt={artikel.prentAlt ?? ''}
            width={600}
            height={338}
            className="prent-hyser w-full rounded-sm border"
          />
        )}
      </Link>
      <KategorieMerker kategorie={artikel.kategorie} />
      <Link href={`/artikel/${artikel.slug}`} className="block">
        <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight group-hover:underline underline-offset-4">
          {artikel.titel}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{artikel.uittreksel}</p>
      </Link>
    </article>
  )
}
