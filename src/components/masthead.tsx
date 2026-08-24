import Link from 'next/link'
import { KATEGORIEE } from '@/lib/inhoud'
import { TemaWisselaar } from '@/components/tema-wisselaar'

export function Masthead() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex flex-col">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--merk-groen)' }}
          >
            Die Transvaler
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--merk-goud)' }}
          >
            fopnuus wat jy kan vertrou
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
