import Link from 'next/link'
import { KATEGORIEE } from '@/lib/inhoud'
import { TemaWisselaar } from '@/components/tema-wisselaar'

export function Masthead() {
  return (
    <header>
      {/* Dateline strip. Real papers carry issue and price here; ours carries the
          one piece of production information that actually matters. */}
      <div className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Jaargang 1 · Nr. 3 · Prys: Gratis
          </p>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Geen feite nagegaan nie
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        {/* The wordmark is stacked to match the logo. The visual split would read
            as two separate words to a screen reader, so the link carries the real
            name and the decorative spans are hidden from the accessibility tree. */}
        <Link
          href="/"
          aria-label="Die Transvaler — fopnuus wat jy kan vertrou"
          className="flex flex-col"
        >
          <span
            aria-hidden
            className="text-4xl font-bold leading-[0.92] tracking-tight text-merk-groen"
          >
            <span className="block">die trans</span>
            <span className="block">
              valer <span className="text-[0.8em]">🌽</span>
            </span>
          </span>
          <span
            aria-hidden
            className="mt-2 font-mono text-[11px] tracking-tight text-merk-goud"
          >
            fopnuus wat jy kan vertrou
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-sm border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Fopnuus
          </span>
          <TemaWisselaar />
        </div>
      </div>

      {/* Section nav sits on the brand green — the one place navigation and brand
          are the same thing. White on it measures 6.4:1 in light, 8.6:1 in dark. */}
      <nav className="bg-merk-groen-band">
        <ul className="mx-auto flex max-w-5xl gap-7 overflow-x-auto px-6 py-2.5">
          {KATEGORIEE.map((kategorie) => (
            <li key={kategorie.slug}>
              <Link
                href={`/kategorie/${kategorie.slug}`}
                className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-white underline-offset-4 transition-colors hover:underline focus-visible:underline"
              >
                {kategorie.naam}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
