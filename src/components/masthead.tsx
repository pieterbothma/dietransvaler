import Link from 'next/link'
import { KATEGORIEE } from '@/lib/inhoud'
import { TemaWisselaar } from '@/components/tema-wisselaar'

export function Masthead() {
  return (
    <header className="border-b">
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
          <span aria-hidden className="mt-2 text-xs font-semibold text-merk-goud">
            fopnuus wat jy kan vertrou
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground">
            Fopnuus
          </span>
          <TemaWisselaar />
        </div>
      </div>

      <nav className="border-t">
        <ul className="mx-auto flex max-w-5xl gap-6 px-6 py-3 text-sm">
          {KATEGORIEE.map((kategorie) => (
            <li key={kategorie.slug}>
              <Link
                href={`/kategorie/${kategorie.slug}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
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
