import matter from 'gray-matter'
import { z } from 'zod'
import type { Artikel } from './tipes'

const kategorieSkema = z.enum(['politiek', 'sake', 'sport', 'wereld', 'lewe'])

const datumSkema = z
  .union([z.string(), z.date()])
  .transform((waarde) =>
    waarde instanceof Date ? waarde.toISOString().slice(0, 10) : waarde,
  )
  .refine((waarde) => /^\d{4}-\d{2}-\d{2}$/.test(waarde), {
    message: 'datum must be an ISO date, e.g. 2026-08-24',
  })

const frontmatterSkema = z
  .object({
    titel: z.string().min(1),
    uittreksel: z.string().min(1),
    kategorie: kategorieSkema,
    datum: datumSkema,
    skrywer: z.string().min(1),
    prent: z.string().min(1).optional(),
    prentAlt: z.string().min(1).optional(),
    prentBronskrif: z.string().min(1).optional(),
  })
  .refine((data) => !data.prentBronskrif || Boolean(data.prent), {
    message: 'prentBronskrif requires prent',
    path: ['prent'],
  })
  .refine((data) => !data.prent || Boolean(data.prentAlt), {
    message: 'prent requires prentAlt',
    path: ['prentAlt'],
  })

/**
 * Parse a raw MDX file into an Artikel. Pure — no filesystem access.
 * Throws with the filename and offending fields when frontmatter is invalid,
 * so a bad article fails the build rather than rendering half-broken.
 */
export function parseerArtikel(rou: string, slug: string): Artikel {
  const { data, content } = matter(rou)
  const resultaat = frontmatterSkema.safeParse(data)

  if (!resultaat.success) {
    const besonderhede = resultaat.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid frontmatter in ${slug}.mdx — ${besonderhede}`)
  }

  return { slug, ...resultaat.data, inhoud: content }
}
