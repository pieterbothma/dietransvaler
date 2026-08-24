import Image from 'next/image'
import Link from 'next/link'
import { kategorieNaam, type ArtikelMeta } from '@/lib/inhoud'

export function ArtikelKaart({ artikel }: { artikel: ArtikelMeta }) {
  return (
    <article className="group border-t pt-5">
      <Link href={`/artikel/${artikel.slug}`} className="block">
        {artikel.prent && (
          <Image
            src={artikel.prent}
            alt={artikel.prentAlt ?? ''}
            width={600}
            height={338}
            className="mb-4 w-full rounded-sm border"
          />
        )}
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--merk-goud)' }}
        >
          {kategorieNaam(artikel.kategorie)}
        </span>
        <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight group-hover:underline underline-offset-4">
          {artikel.titel}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{artikel.uittreksel}</p>
      </Link>
    </article>
  )
}
