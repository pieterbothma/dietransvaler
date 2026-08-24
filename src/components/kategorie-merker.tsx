import Link from 'next/link'
import { kategorieNaam, type Kategorie } from '@/lib/inhoud'

export function KategorieMerker({ kategorie }: { kategorie: Kategorie }) {
  return (
    <Link
      href={`/kategorie/${kategorie}`}
      className="text-xs font-semibold uppercase tracking-widest text-merk-goud"
    >
      {kategorieNaam(kategorie)}
    </Link>
  )
}
