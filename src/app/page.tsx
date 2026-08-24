import Image from 'next/image'
import Link from 'next/link'
import { ArtikelKaart } from '@/components/artikel-kaart'
import { SatireDefinisie } from '@/components/satire-definisie'
import { getAlleArtikels, kategorieNaam } from '@/lib/inhoud'

export default async function Voorblad() {
  const artikels = await getAlleArtikels()

  if (artikels.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">
          Nog geen artikels nie. Die redaksie is by die koffiemasjien.
        </p>
        <SatireDefinisie />
      </div>
    )
  }

  const [hoofberig, ...res] = artikels

  return (
    <div className="space-y-12">
      <article>
        <Link href={`/artikel/${hoofberig.slug}`} className="group block">
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
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--merk-goud)' }}
          >
            {kategorieNaam(hoofberig.kategorie)}
          </span>
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
          {res.map((artikel) => (
            <ArtikelKaart key={artikel.slug} artikel={artikel} />
          ))}
        </div>
      )}

      <SatireDefinisie />
    </div>
  )
}
