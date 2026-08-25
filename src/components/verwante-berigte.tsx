import Image from 'next/image'
import Link from 'next/link'
import { KategorieMerker } from '@/components/kategorie-merker'
import { getAlleArtikels, type ArtikelMeta } from '@/lib/inhoud'

/**
 * "Lees ook" — a horizontally scrollable strip of the other stories.
 *
 * Deliberately a native scroll container with CSS scroll-snap rather than a
 * JS carousel. Native scrolling already works with touch, trackpad, shift+wheel
 * and keyboard, and it cannot break; an auto-advancing carousel would move
 * content while someone is reading it, which is the one thing a newspaper
 * layout must not do.
 */
export async function VerwanteBerigte({ huidige }: { huidige: string }) {
  const alles = await getAlleArtikels()
  const ander = alles.filter((a) => a.slug !== huidige)
  if (ander.length === 0) return null

  return (
    <section aria-labelledby="lees-ook" className="mt-16">
      <h2
        id="lees-ook"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        Lees ook
      </h2>

      <ul className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {ander.map((artikel) => (
          <li
            key={artikel.slug}
            className="w-[240px] shrink-0 snap-start sm:w-[260px]"
          >
            <Kaartjie artikel={artikel} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Kaartjie({ artikel }: { artikel: ArtikelMeta }) {
  return (
    <article className="group">
      {artikel.prent && (
        <Link
          href={`/artikel/${artikel.slug}`}
          tabIndex={-1}
          aria-hidden
          className="mb-3 block overflow-hidden rounded-sm"
        >
          <Image
            src={artikel.prent}
            alt=""
            width={520}
            height={293}
            className="prent-hyser aspect-[16/9] w-full rounded-sm border object-cover"
          />
        </Link>
      )}
      <KategorieMerker kategorie={artikel.kategorie} />
      <h3 className="mt-2 text-sm font-semibold leading-snug tracking-tight">
        <Link
          href={`/artikel/${artikel.slug}`}
          className="underline-offset-4 group-hover:underline"
        >
          {artikel.titel}
        </Link>
      </h3>
    </article>
  )
}
