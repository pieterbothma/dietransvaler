import Image from 'next/image'
import Link from 'next/link'
import { ArtikelKaart } from '@/components/artikel-kaart'
import { Inskryf } from '@/components/inskryf'
import { KategorieMerker } from '@/components/kategorie-merker'
import { getAlleArtikels } from '@/lib/inhoud'

export default async function Voorblad() {
  const artikels = await getAlleArtikels()

  if (artikels.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">
          Nog geen artikels nie. Die redaksie is by die koffiemasjien.
        </p>
      </div>
    )
  }

  // A standing story runs permanently in its own slot, so it is kept out of both
  // the lead position and the grid — otherwise it would push real news down the
  // page every time something newer is published.
  const staandes = artikels.filter((a) => a.staande)
  const lopend = artikels.filter((a) => !a.staande)

  if (lopend.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">
          Nog geen artikels nie. Die redaksie is by die koffiemasjien.
        </p>
      </div>
    )
  }

  // An explicitly flagged lead wins over recency — a front page is an editorial
  // decision, not a clock. Falls back to the newest story when nothing is flagged.
  const hoofberig = lopend.find((a) => a.hoofberig) ?? lopend[0]
  const res = lopend.filter((a) => a.slug !== hoofberig.slug)

  return (
    <div className="space-y-12">
      <article className="group opkom">
        <Link href={`/artikel/${hoofberig.slug}`} className="block">
          {hoofberig.prent && (
            <Image
              src={hoofberig.prent}
              alt={hoofberig.prentAlt ?? ''}
              width={1200}
              height={675}
              className="mb-6 w-full rounded-sm border"
              priority
            />
          )}
        </Link>
        <KategorieMerker kategorie={hoofberig.kategorie} />
        <Link href={`/artikel/${hoofberig.slug}`} className="block">
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight group-hover:underline underline-offset-4">
            {hoofberig.titel}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {hoofberig.uittreksel}
          </p>
        </Link>
      </article>

      {res.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {res.map((artikel, i) => (
            <div
              key={artikel.slug}
              className="opkom"
              style={{ animationDelay: `${110 + i * 90}ms` }}
            >
              <ArtikelKaart artikel={artikel} />
            </div>
          ))}
        </div>
      )}

      {staandes.map((artikel) => (
        <article
          key={artikel.slug}
          className="group opkom rounded-sm border border-dashed p-6"
          style={{ animationDelay: '420ms' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Staande berig · bly permanent op
          </p>
          <Link href={`/artikel/${artikel.slug}`} className="block">
            <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight underline-offset-4 group-hover:underline">
              {artikel.titel}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {artikel.uittreksel}
            </p>
          </Link>
        </article>
      ))}

      <Inskryf />
    </div>
  )
}
