export type Kategorie = 'politiek' | 'sake' | 'sport' | 'wereld' | 'lewe'

export interface ArtikelMeta {
  slug: string
  titel: string
  uittreksel: string
  kategorie: Kategorie
  /** ISO 8601 date, e.g. "2026-08-24" */
  datum: string
  skrywer: string
  prent?: string
  prentBronskrif?: string
}

export interface Artikel extends ArtikelMeta {
  /** Raw MDX body, compiled at render time. */
  inhoud: string
}

export const KATEGORIEE = [
  { slug: 'politiek', naam: 'Politiek' },
  { slug: 'sake', naam: 'Sake' },
  { slug: 'sport', naam: 'Sport' },
  { slug: 'wereld', naam: 'Wêreld' },
  { slug: 'lewe', naam: 'Lewe' },
] as const satisfies readonly { slug: Kategorie; naam: string }[]

export function kategorieNaam(slug: Kategorie): string {
  return KATEGORIEE.find((k) => k.slug === slug)!.naam
}
