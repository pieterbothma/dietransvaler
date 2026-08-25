import Link from 'next/link'
import { KATEGORIEE } from '@/lib/inhoud'
import { REDAKSIE } from '@/lib/redaksie'

/**
 * Footer as a newspaper colophon: the staff masthead, the sections, and the
 * disclaimer. Real papers print who made the thing; printing ours is both the
 * convention and the joke, since the staff are as invented as the news.
 */
export function Voetskrif() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Identity */}
          <div>
            <p className="text-xl font-bold leading-[0.92] tracking-tight text-merk-groen">
              <span className="block">die trans</span>
              <span className="block">valer 🌽</span>
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-tight text-merk-goud">
              fopnuus wat jy kan vertrou
            </p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-foreground">
              Die Transvaler is &apos;n satiriese publikasie. Alle artikels is
              versinsels. Enige ooreenkoms met werklike gebeure is opsetlik; die
              gebeure self is nie werklik nie.
            </p>
          </div>

          {/* Sections */}
          <nav aria-labelledby="voet-afdelings">
            <h2
              id="voet-afdelings"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Afdelings
            </h2>
            <ul className="mt-4 space-y-2">
              {KATEGORIEE.map((k) => (
                <li key={k.slug}>
                  <Link
                    href={`/kategorie/${k.slug}`}
                    className="text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    {k.naam}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Colophon */}
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Redaksie
            </h2>
            <ul className="mt-4 space-y-2">
              {REDAKSIE.map((lid) => (
                <li
                  key={lid.naam}
                  className="flex items-baseline justify-between gap-4 border-b border-dashed pb-2 last:border-0"
                >
                  <span className="text-sm text-foreground">{lid.naam}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {lid.rol}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Fopnuus · Niks hierin het gebeur nie
          </p>
          <Link
            href="/oor-ons"
            className="text-sm text-foreground underline underline-offset-4"
          >
            Oor ons
          </Link>
        </div>
      </div>
    </footer>
  )
}
