import Link from 'next/link'
import { kategorieNaam, type Kategorie } from '@/lib/inhoud'

/**
 * Section eyebrow. Deliberately monochrome: the brand colours now carry the nav
 * and the disclaimer band, and gold text directly beneath a gold band reads muddy.
 */
export function KategorieMerker({ kategorie }: { kategorie: Kategorie }) {
  return (
    <Link
      href={`/kategorie/${kategorie}`}
      className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
    >
      {kategorieNaam(kategorie)}
    </Link>
  )
}
