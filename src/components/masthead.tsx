import Link from 'next/link'
import { KATEGORIEE } from '@/lib/inhoud'
import { TemaWisselaar } from '@/components/tema-wisselaar'

export function Masthead() {
  return (
    <header>
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

        <TemaWisselaar />
      </div>

      {/* Section nav sits on the brand green — the one place navigation and brand
          are the same thing. White on it measures 6.4:1 in light, 8.6:1 in dark. */}
      <nav className="bg-merk-groen-band">
        <ul className="mx-auto flex max-w-5xl gap-7 overflow-x-auto px-6 py-2.5">
          <li>
            <Link
              href="/"
              className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-white underline-offset-4 transition-colors hover:underline focus-visible:underline"
            >
              Tuis
            </Link>
          </li>
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
