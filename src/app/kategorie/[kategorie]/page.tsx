import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArtikelKaart } from '@/components/artikel-kaart'
import {
  getArtikelsByKategorie,
  KATEGORIEE,
  kategorieNaam,
  type Kategorie,
} from '@/lib/inhoud'

type Props = { params: Promise<{ kategorie: string }> }

export function generateStaticParams() {
  return KATEGORIEE.map((k) => ({ kategorie: k.slug }))
}

function isKategorie(waarde: string): waarde is Kategorie {
  return KATEGORIEE.some((k) => k.slug === waarde)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategorie } = await params
  if (!isKategorie(kategorie)) return {}
  return { title: kategorieNaam(kategorie) }
}

export default async function KategorieBladsy({ params }: Props) {
  const { kategorie } = await params
  if (!isKategorie(kategorie)) notFound()

  const artikels = await getArtikelsByKategorie(kategorie)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {kategorieNaam(kategorie)}
      </h1>

      {artikels.length === 0 ? (
        <p className="text-muted-foreground">
          Nog niks onder {kategorieNaam(kategorie)} nie. Ons versin so vinnig as wat ons kan.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {artikels.map((artikel) => (
            <ArtikelKaart key={artikel.slug} artikel={artikel} />
          ))}
        </div>
      )}
    </div>
  )
}
