# Die Transvaler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build dietransvaler.co.za — a statically generated Afrikaans satirical news site whose articles are MDX files in git.

**Architecture:** A single Next.js 16 App Router app, fully static. All filesystem access is confined to a content layer at `src/lib/inhoud/`; route components consume plain typed objects and never touch `fs` or `gray-matter`. Article parsing is split into a pure function (fully unit-testable, no I/O) and thin filesystem wrappers that take an injectable directory so tests run against fixtures.

**Tech Stack:** Next.js 16.3.2, React 19, TypeScript, Tailwind v4, shadcn/ui, next-themes, Geist via `next/font`, zod, gray-matter 4, next-mdx-remote 6 (`/rsc` entry), vitest.

**Spec:** `docs/superpowers/specs/2026-08-24-dietransvaler-design.md`

## Global Constraints

Every task's requirements implicitly include these.

- **Brand name is "Die Transvaler"** — the definite article is part of the name here (unlike Buitelyn). Tagline: `fopnuus wat jy kan vertrou`.
- **Afrikaans for anything Piet or a reader sees**: UI copy, MDX frontmatter keys, article content, commit messages. **English for code**: type names, function bodies, comments, test descriptions. Function and file names in the content layer use Afrikaans domain nouns (`getAlleArtikels`, `inhoud`, `artikel`) because they name domain concepts — this is deliberate and consistent, not drift.
- **No route file may import `fs`, `node:fs`, `path`, or `gray-matter`.** Those live only in `src/lib/inhoud/`. `MDXRemote` is confined to the single component `src/components/artikel-inhoud.tsx`.
- **Colour is restricted to the masthead and category tags** (logo green `#2D6A4F`, gold `#E0A526`). Every other surface is monochrome. No gradients, no glow, no glassmorphism. Hairline borders over drop-shadows.
- **Light mode is the default theme**; dark mode ships fully built.
- **A "FOPNUUS" marker appears in the masthead and footer on every page.**
- **The satire definition appears at the foot of every article and the voorblad.** The copy is fixed and must be reproduced verbatim — do not reword, shorten, or "improve" it:
  > die gebruik van humor, ironie, oordrywing of bespotting om mense se onnoselheid bloot te lê en te kritiseer, veral in die konteks van kontemporêre politiek en ander aktuele kwessies.
- **Canonical origin is `https://dietransvaler.co.za`** — use it for `metadataBase`, OpenGraph, and sitemap.
- **Categories** are exactly: `politiek`, `sake`, `sport`, `wereld`, `lewe` (ASCII slugs; display names carry diacritics — "Wêreld").
- **Commit after every task.** Small, frequent commits with Afrikaans messages.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/inhoud/tipes.ts` | Types + `KATEGORIEE` constant. No logic. |
| `src/lib/inhoud/skema.ts` | zod schema + `parseerArtikel` — pure, no I/O. |
| `src/lib/inhoud/lees.ts` | Filesystem reads. The only `fs` consumer. |
| `src/lib/inhoud/index.ts` | Public barrel — what routes import. |
| `src/components/masthead.tsx` | Masthead: logo, FOPNUUS marker, category nav, theme toggle. |
| `src/components/voetskrif.tsx` | Footer + disclaimer. |
| `src/components/artikel-kaart.tsx` | Article card for listings. |
| `src/components/artikel-inhoud.tsx` | MDX rendering. Only `MDXRemote` consumer. |
| `src/components/satire-definisie.tsx` | The satire definition, as a dictionary entry. |
| `src/components/tema-verskaffer.tsx` | `next-themes` provider wrapper. |
| `src/app/layout.tsx` | Root layout, fonts, theme, masthead/footer. |
| `src/app/page.tsx` | Voorblad. |
| `src/app/artikel/[slug]/page.tsx` | Article page. |
| `src/app/kategorie/[kategorie]/page.tsx` | Category index. |
| `src/app/oor-ons/page.tsx` | About + disclaimer. |
| `src/app/sitemap.ts`, `src/app/robots.ts` | SEO metadata routes. |
| `content/artikels/*.mdx` | The articles. |
| `tests/fixtures/artikels/` | Fixture MDX for content-layer tests. |

---

## Task 1: Scaffold the app and test harness

**Files:**
- Create: `~/DieTransvaler/` (Next app), `vitest.config.ts`, `tests/sanity.test.ts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: a booting Next 16 app with `npm test` wired to vitest, path alias `@/*` → `src/*`.

- [ ] **Step 1: Scaffold Next.js into the existing folder**

The folder already exists and contains `docs/` and a git repo, so scaffold in place and accept the non-empty directory.

```bash
cd ~/DieTransvaler
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
```

If it refuses because the directory is non-empty, scaffold to a temp dir and move files in:

```bash
cd ~ && npx create-next-app@latest _dtv-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
rsync -a --exclude=.git ~/_dtv-tmp/ ~/DieTransvaler/ && rm -rf ~/_dtv-tmp
```

- [ ] **Step 2: Verify the dev server boots**

```bash
cd ~/DieTransvaler && npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Install runtime and test dependencies**

```bash
cd ~/DieTransvaler
npm install gray-matter@^4.0.3 next-mdx-remote@^6.0.0 next-themes@^0.4.6 zod@^4.4.3 @vercel/analytics@^2.0.1
npm install -D vitest@^3 @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 4: Initialise shadcn/ui**

```bash
cd ~/DieTransvaler && npx shadcn@latest init --yes --base-color neutral
```

Neutral base keeps everything monochrome by default; green and gold are added by hand later as brand tokens only.

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 6: Add test scripts to `package.json`**

Add to the `scripts` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Write a sanity test**

Create `tests/sanity.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 8: Run the tests**

```bash
cd ~/DieTransvaler && npm test
```

Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Stel Next.js-projek en toetsraamwerk op"
```

---

## Task 2: Content layer — types and pure parsing

**Files:**
- Create: `src/lib/inhoud/tipes.ts`, `src/lib/inhoud/skema.ts`, `tests/inhoud/skema.test.ts`

**Interfaces:**
- Consumes: zod, gray-matter.
- Produces:
  - `type Kategorie = 'politiek' | 'sake' | 'sport' | 'wereld' | 'lewe'`
  - `interface ArtikelMeta { slug, titel, uittreksel, kategorie, datum, skrywer, prent?, prentBronskrif? }`
  - `interface Artikel extends ArtikelMeta { inhoud: string }`
  - `const KATEGORIEE: readonly { slug: Kategorie; naam: string }[]`
  - `function parseerArtikel(rou: string, slug: string): Artikel` — throws on invalid frontmatter, message includes the slug.

- [ ] **Step 1: Write `src/lib/inhoud/tipes.ts`**

```ts
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
```

- [ ] **Step 2: Write the failing tests**

Create `tests/inhoud/skema.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseerArtikel } from '@/lib/inhoud/skema'

const GELDIG = `---
titel: "Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse"
uittreksel: "Verbruikers kan voortaan kies tussen Fase 2 en Fase 6."
kategorie: politiek
datum: 2026-08-24
skrywer: "Ons Politieke Redakteur"
prent: /prente/eskom.jpg
prentBronskrif: "'n Argieffoto wat niks bewys nie."
---

Die aankondiging is Maandag gemaak.
`

describe('parseerArtikel', () => {
  it('parses valid frontmatter into an Artikel', () => {
    const artikel = parseerArtikel(GELDIG, 'eskom-lewenstyl')

    expect(artikel.slug).toBe('eskom-lewenstyl')
    expect(artikel.titel).toBe("Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse")
    expect(artikel.kategorie).toBe('politiek')
    expect(artikel.skrywer).toBe('Ons Politieke Redakteur')
    expect(artikel.prent).toBe('/prente/eskom.jpg')
  })

  it('normalises an unquoted YAML date to an ISO date string', () => {
    const artikel = parseerArtikel(GELDIG, 'eskom-lewenstyl')
    expect(artikel.datum).toBe('2026-08-24')
  })

  it('keeps the MDX body as inhoud', () => {
    const artikel = parseerArtikel(GELDIG, 'eskom-lewenstyl')
    expect(artikel.inhoud.trim()).toBe('Die aankondiging is Maandag gemaak.')
  })

  it('allows an article with no image', () => {
    const sonderPrent = `---
titel: "Munisipaliteit belowe die pothole is nou 'n waterfunksie"
uittreksel: "Inwoners word gevra om nie daarin te swem nie."
kategorie: lewe
datum: 2026-08-20
skrywer: "Ons Munisipale Korrespondent"
---

Die raad het eenparig gestem.
`
    const artikel = parseerArtikel(sonderPrent, 'pothole-waterfunksie')
    expect(artikel.prent).toBeUndefined()
    expect(artikel.prentBronskrif).toBeUndefined()
  })

  it('rejects a missing required field and names the file', () => {
    const geenTitel = `---
uittreksel: "Iets"
kategorie: sport
datum: 2026-08-20
skrywer: "Ons Sportredakteur"
---

Body.
`
    expect(() => parseerArtikel(geenTitel, 'stukkend')).toThrowError(/stukkend\.mdx/)
    expect(() => parseerArtikel(geenTitel, 'stukkend')).toThrowError(/titel/)
  })

  it('rejects an unknown category', () => {
    const slegteKategorie = `---
titel: "Kop"
uittreksel: "Iets"
kategorie: resepte
datum: 2026-08-20
skrywer: "Ons Redakteur"
---

Body.
`
    expect(() => parseerArtikel(slegteKategorie, 'slegte-kat')).toThrowError(/kategorie/)
  })

  it('rejects prentBronskrif without prent', () => {
    const weesBronskrif = `---
titel: "Kop"
uittreksel: "Iets"
kategorie: sake
datum: 2026-08-20
skrywer: "Ons Sakeredakteur"
prentBronskrif: "'n Bronskrif sonder 'n prent."
---

Body.
`
    expect(() => parseerArtikel(weesBronskrif, 'wees-bronskrif')).toThrowError(/prent/)
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd ~/DieTransvaler && npm test
```

Expected: FAIL — cannot resolve `@/lib/inhoud/skema`.

- [ ] **Step 4: Write `src/lib/inhoud/skema.ts`**

`gray-matter` parses an unquoted YAML date such as `2026-08-24` into a JavaScript `Date`, so the schema must accept both `Date` and `string` and normalise to an ISO date. `toISOString()` is safe here because YAML parses a bare date as UTC midnight.

```ts
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
    prentBronskrif: z.string().min(1).optional(),
  })
  .refine((data) => !data.prentBronskrif || Boolean(data.prent), {
    message: 'prentBronskrif requires prent',
    path: ['prent'],
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
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd ~/DieTransvaler && npm test
```

Expected: all tests in `tests/inhoud/skema.test.ts` PASS.

- [ ] **Step 6: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg artikeltipes en frontmatter-validering by"
```

---

## Task 3: Content layer — filesystem reads

**Files:**
- Create: `src/lib/inhoud/lees.ts`, `src/lib/inhoud/index.ts`, `tests/inhoud/lees.test.ts`, `tests/fixtures/artikels/*.mdx`

**Interfaces:**
- Consumes: `parseerArtikel`, `Artikel`, `ArtikelMeta`, `Kategorie` from Task 2.
- Produces:
  - `getAlleArtikels(gids?: string): Promise<ArtikelMeta[]>` — newest first, ties broken by slug ascending
  - `getArtikelBySlug(slug: string, gids?: string): Promise<Artikel | null>`
  - `getArtikelsByKategorie(kategorie: Kategorie, gids?: string): Promise<ArtikelMeta[]>`
  - `getAlleSlugs(gids?: string): Promise<string[]>`
  - `src/lib/inhoud/index.ts` re-exports all of the above plus `KATEGORIEE`, `kategorieNaam`, and the types.

The optional `gids` (directory) parameter exists so tests read fixtures instead of real content. Production callers always omit it.

- [ ] **Step 1: Create the fixture articles**

Create `tests/fixtures/artikels/eskom-lewenstyl.mdx`:

```mdx
---
titel: "Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse"
uittreksel: "Verbruikers kan voortaan kies tussen Fase 2 en Fase 6."
kategorie: politiek
datum: 2026-08-24
skrywer: "Ons Politieke Redakteur"
---

Die aankondiging is Maandag gemaak.
```

Create `tests/fixtures/artikels/pothole-waterfunksie.mdx`:

```mdx
---
titel: "Munisipaliteit belowe die pothole is nou 'n waterfunksie"
uittreksel: "Inwoners word gevra om nie daarin te swem nie."
kategorie: lewe
datum: 2026-08-20
skrywer: "Ons Munisipale Korrespondent"
---

Die raad het eenparig gestem.
```

Create `tests/fixtures/artikels/appelkoos-krisis.mdx` — same date as the Eskom piece, to exercise tie-breaking:

```mdx
---
titel: "Nasionale appelkooskonfyt-tekort tref beskuitbedryf"
uittreksel: "Kenners waarsku dit kan tot Desember duur."
kategorie: sake
datum: 2026-08-24
skrywer: "Ons Sakeredakteur"
---

Die tekort het Vrydag begin.
```

- [ ] **Step 2: Write the failing tests**

Create `tests/inhoud/lees.test.ts`:

```ts
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getAlleArtikels,
  getAlleSlugs,
  getArtikelBySlug,
  getArtikelsByKategorie,
} from '@/lib/inhoud/lees'

const GIDS = path.join(process.cwd(), 'tests/fixtures/artikels')

describe('getAlleArtikels', () => {
  it('returns every fixture article', async () => {
    const artikels = await getAlleArtikels(GIDS)
    expect(artikels).toHaveLength(3)
  })

  it('sorts newest first, breaking ties by slug ascending', async () => {
    const artikels = await getAlleArtikels(GIDS)
    expect(artikels.map((a) => a.slug)).toEqual([
      'appelkoos-krisis',
      'eskom-lewenstyl',
      'pothole-waterfunksie',
    ])
  })

  it('omits the body from listings', async () => {
    const artikels = await getAlleArtikels(GIDS)
    expect(artikels[0]).not.toHaveProperty('inhoud')
  })
})

describe('getArtikelBySlug', () => {
  it('returns the article with its body', async () => {
    const artikel = await getArtikelBySlug('eskom-lewenstyl', GIDS)
    expect(artikel?.titel).toBe("Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse")
    expect(artikel?.inhoud.trim()).toBe('Die aankondiging is Maandag gemaak.')
  })

  it('returns null for an unknown slug', async () => {
    expect(await getArtikelBySlug('bestaan-nie', GIDS)).toBeNull()
  })
})

describe('getArtikelsByKategorie', () => {
  it('returns only articles in that category', async () => {
    const artikels = await getArtikelsByKategorie('politiek', GIDS)
    expect(artikels.map((a) => a.slug)).toEqual(['eskom-lewenstyl'])
  })

  it('returns an empty array for a category with no articles', async () => {
    expect(await getArtikelsByKategorie('sport', GIDS)).toEqual([])
  })
})

describe('getAlleSlugs', () => {
  it('returns a slug per MDX file', async () => {
    const slugs = await getAlleSlugs(GIDS)
    expect(slugs.sort()).toEqual([
      'appelkoos-krisis',
      'eskom-lewenstyl',
      'pothole-waterfunksie',
    ])
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd ~/DieTransvaler && npm test
```

Expected: FAIL — cannot resolve `@/lib/inhoud/lees`.

- [ ] **Step 4: Write `src/lib/inhoud/lees.ts`**

```ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { parseerArtikel } from './skema'
import type { Artikel, ArtikelMeta, Kategorie } from './tipes'

const STANDAARD_GIDS = path.join(process.cwd(), 'content', 'artikels')

async function leesArtikels(gids: string): Promise<Artikel[]> {
  const lêers = await fs.readdir(gids)
  const mdx = lêers.filter((naam) => naam.endsWith('.mdx'))

  return Promise.all(
    mdx.map(async (naam) => {
      const slug = naam.replace(/\.mdx$/, '')
      const rou = await fs.readFile(path.join(gids, naam), 'utf8')
      return parseerArtikel(rou, slug)
    }),
  )
}

/** Strip the body so listings never carry article text they will not render. */
function naMeta({ inhoud: _inhoud, ...meta }: Artikel): ArtikelMeta {
  return meta
}

/** Newest first; ties broken by slug ascending so builds are deterministic. */
function sorteer(artikels: ArtikelMeta[]): ArtikelMeta[] {
  return [...artikels].sort((a, b) =>
    a.datum === b.datum ? a.slug.localeCompare(b.slug) : b.datum.localeCompare(a.datum),
  )
}

export async function getAlleArtikels(gids = STANDAARD_GIDS): Promise<ArtikelMeta[]> {
  return sorteer((await leesArtikels(gids)).map(naMeta))
}

export async function getArtikelBySlug(
  slug: string,
  gids = STANDAARD_GIDS,
): Promise<Artikel | null> {
  try {
    const rou = await fs.readFile(path.join(gids, `${slug}.mdx`), 'utf8')
    return parseerArtikel(rou, slug)
  } catch (fout) {
    if ((fout as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw fout
  }
}

export async function getArtikelsByKategorie(
  kategorie: Kategorie,
  gids = STANDAARD_GIDS,
): Promise<ArtikelMeta[]> {
  const alles = await getAlleArtikels(gids)
  return alles.filter((artikel) => artikel.kategorie === kategorie)
}

export async function getAlleSlugs(gids = STANDAARD_GIDS): Promise<string[]> {
  const lêers = await fs.readdir(gids)
  return lêers.filter((naam) => naam.endsWith('.mdx')).map((naam) => naam.replace(/\.mdx$/, ''))
}
```

- [ ] **Step 5: Write the barrel `src/lib/inhoud/index.ts`**

```ts
export { KATEGORIEE, kategorieNaam } from './tipes'
export type { Artikel, ArtikelMeta, Kategorie } from './tipes'
export {
  getAlleArtikels,
  getAlleSlugs,
  getArtikelBySlug,
  getArtikelsByKategorie,
} from './lees'
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
cd ~/DieTransvaler && npm test
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg inhoudlaag by wat artikels van skyf af lees"
```

---

## Task 4: Layout, masthead, footer, and seed articles

**Files:**
- Create: `src/components/masthead.tsx`, `src/components/voetskrif.tsx`, `src/components/tema-verskaffer.tsx`, `src/components/tema-wisselaar.tsx`, `src/components/satire-definisie.tsx`, `content/artikels/*.mdx` (3 seed articles)
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: `KATEGORIEE` from Task 3's barrel.
- Produces: a root layout rendering `<Masthead />` and `<Voetskrif />` around `children`; brand CSS variables `--merk-groen` and `--merk-goud`; `<SatireDefinisie />`, consumed by Tasks 5 and 6.

- [ ] **Step 1: Install the shadcn button (used by the theme toggle)**

```bash
cd ~/DieTransvaler && npx shadcn@latest add button --yes
```

- [ ] **Step 2: Add brand tokens to `src/app/globals.css`**

Append inside the existing `:root` block, and add a matching `.dark` entry:

```css
:root {
  --merk-groen: #2d6a4f;
  --merk-goud: #e0a526;
}

.dark {
  --merk-groen: #4c9a77;
  --merk-goud: #e8b752;
}
```

The dark values are lightened so the brand colours keep contrast against a dark surface. These are the only colour tokens in the project.

- [ ] **Step 3: Write `src/components/tema-verskaffer.tsx`**

```tsx
'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function TemaVerskaffer({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
```

`defaultTheme="light"` and `enableSystem={false}` implement the spec's light-mode-first decision: a first-time reader gets light regardless of their OS setting.

- [ ] **Step 4: Write `src/components/tema-wisselaar.tsx`**

```tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function TemaWisselaar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [gemonteer, setGemonteer] = useState(false)

  // The server cannot know the stored theme, so render a stable placeholder
  // until after hydration to avoid a mismatch.
  useEffect(() => setGemonteer(true), [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Wissel tussen lig en donker"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {gemonteer && resolvedTheme === 'dark' ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  )
}
```

- [ ] **Step 5: Write `src/components/masthead.tsx`**

```tsx
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
```

- [ ] **Step 6: Write `src/components/voetskrif.tsx`**

```tsx
import Link from 'next/link'

export function Voetskrif() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-5xl space-y-2 px-6 py-8 text-sm text-muted-foreground">
        <p className="font-semibold uppercase tracking-widest text-[10px]">
          Fopnuus
        </p>
        <p>
          Die Transvaler is 'n satiriese publikasie. Alle artikels is versinsels.
          Enige ooreenkoms met werklike gebeure is opsetlik, maar die gebeure self
          is dit nie.
        </p>
        <p>
          <Link href="/oor-ons" className="underline underline-offset-4">
            Oor ons
          </Link>
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: Write `src/components/satire-definisie.tsx`**

Rendered as a lexicographic entry, in the same deadpan register as the articles.
The copy is fixed — reproduce it verbatim.

```tsx
export function SatireDefinisie() {
  return (
    <aside className="mt-16 border-t pt-6">
      <p className="flex items-baseline gap-2">
        <span className="text-base font-semibold tracking-tight">satire</span>
        <span className="text-sm italic text-muted-foreground">s.nw.</span>
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        die gebruik van humor, ironie, oordrywing of bespotting om mense se
        onnoselheid bloot te lê en te kritiseer, veral in die konteks van
        kontemporêre politiek en ander aktuele kwessies.
      </p>
    </aside>
  )
}
```

`<aside>` is the correct element here: the definition is tangentially related to
the content it sits beside, which is exactly what assistive technology should be
told about it.

- [ ] **Step 8: Rewrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Masthead } from '@/components/masthead'
import { TemaVerskaffer } from '@/components/tema-verskaffer'
import { Voetskrif } from '@/components/voetskrif'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://dietransvaler.co.za'),
  title: {
    default: 'Die Transvaler — fopnuus wat jy kan vertrou',
    template: '%s | Die Transvaler',
  },
  description: 'Afrikaanse satiriese nuus. Alles hierin is versin.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="af" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TemaVerskaffer>
          <Masthead />
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
          <Voetskrif />
        </TemaVerskaffer>
        <Analytics />
      </body>
    </html>
  )
}
```

`lang="af"` matters for screen readers and for the browser's hyphenation and spell-checking.

- [ ] **Step 9: Write three seed articles**

Create `content/artikels/eskom-lewenstyl-keuse.mdx`:

```mdx
---
titel: "Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse"
uittreksel: "Verbruikers kan voortaan kies tussen Fase 2 en Fase 6, of 'n oorspronklike pakket saamstel."
kategorie: politiek
datum: 2026-08-24
skrywer: "Ons Politieke Redakteur"
---

Eskom het Maandag aangekondig dat beurtkrag nie langer 'n krisis is nie, maar 'n
"buigsame energie-leefstyl" wat verbruikers self kan kies.

"Ons het opgehou om dit 'n onderbreking te noem," het 'n woordvoerder gesê. "Dit
is 'n onderbreking van jou gewoontes, en gewoontes is ongesond."

Verbruikers kan voortaan tussen drie pakkette kies. Die Basiese pakket bied vier
ure krag per dag. Die Premium pakket bied ook vier ure, maar jy weet vooraf watter.
```

Create `content/artikels/appelkoos-tekort.mdx`:

```mdx
---
titel: "Nasionale appelkooskonfyt-tekort tref beskuitbedryf"
uittreksel: "Kenners waarsku die tekort kan tot Desember duur, en dalk langer as ouma's begin hamster."
kategorie: sake
datum: 2026-08-22
skrywer: "Ons Sakeredakteur"
---

'n Landwye tekort aan appelkooskonfyt het Vrydag begin nadat drie ouma's in die
Vrystaat gelyktydig besluit het om te bak.

Die beskuitbedryf, wat na raming R400 miljoen werd is en heeltemal op konfyt
staatmaak, het onmiddellik ineengestort.

"Ons het gewaarsku," het 'n ontleder gesê. "Niemand luister ooit na die
konfyt-ontleders nie."
```

Create `content/artikels/pothole-waterfunksie.mdx`:

```mdx
---
titel: "Munisipaliteit verklaar pothole amptelik 'n waterfunksie"
uittreksel: "Inwoners word gevra om nie daarin te swem nie, maar mag wel munte ingooi."
kategorie: lewe
datum: 2026-08-19
skrywer: "Ons Munisipale Korrespondent"
---

Die raad het eenparig gestem om die pothole op die hoek van Kerkstraat en
Voortrekkerweg as 'n waterfunksie te herklassifiseer.

Die besluit spaar die munisipaliteit die koste om dit te herstel, en skep
terselfdertyd wat die burgemeester "'n toeriste-aantreklikheid met diepte"
genoem het.

Inwoners word versoek om nie daarin te swem nie. Munte word wel verwelkom.
```

- [ ] **Step 10: Verify the build succeeds and the layout renders**

```bash
cd ~/DieTransvaler && npm run build && npm run dev
```

Open `http://localhost:3000` and confirm: masthead shows "Die Transvaler" in green with the gold tagline, the FOPNUUS badge is visible, category nav lists all five, the footer disclaimer is present, and the theme toggle switches light/dark.

- [ ] **Step 11: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg uitleg, masthead, voetskrif, satire-definisie en eerste drie artikels by"
```

---

## Task 5: Article page

**Files:**
- Create: `src/components/artikel-inhoud.tsx`, `src/app/artikel/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getArtikelBySlug`, `getAlleSlugs`, `kategorieNaam` from the barrel; `<SatireDefinisie />` from Task 4.
- Produces: a statically generated route at `/artikel/[slug]`.

- [ ] **Step 1: Write `src/components/artikel-inhoud.tsx`**

This is the only file permitted to import `MDXRemote`.

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc'

export function ArtikelInhoud({ inhoud }: { inhoud: string }) {
  return (
    <div className="space-y-4 text-base leading-7 [&>p]:text-foreground/90">
      <MDXRemote source={inhoud} />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/artikel/[slug]/page.tsx`**

In Next 16, `params` is a Promise and must be awaited.

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArtikelInhoud } from '@/components/artikel-inhoud'
import { SatireDefinisie } from '@/components/satire-definisie'
import { getAlleSlugs, getArtikelBySlug, kategorieNaam } from '@/lib/inhoud'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAlleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artikel = await getArtikelBySlug(slug)
  if (!artikel) return {}

  return {
    title: artikel.titel,
    description: artikel.uittreksel,
    openGraph: {
      title: artikel.titel,
      description: artikel.uittreksel,
      type: 'article',
      url: `/artikel/${artikel.slug}`,
      images: artikel.prent ? [artikel.prent] : undefined,
    },
  }
}

export default async function ArtikelBladsy({ params }: Props) {
  const { slug } = await params
  const artikel = await getArtikelBySlug(slug)
  if (!artikel) notFound()

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href={`/kategorie/${artikel.kategorie}`}
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--merk-goud)' }}
      >
        {kategorieNaam(artikel.kategorie)}
      </Link>

      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">
        {artikel.titel}
      </h1>

      <p className="mt-4 text-lg text-muted-foreground">{artikel.uittreksel}</p>

      <p className="mt-4 text-sm text-muted-foreground">
        {artikel.skrywer} ·{' '}
        <time dateTime={artikel.datum}>
          {new Date(artikel.datum).toLocaleDateString('af-ZA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </p>

      {artikel.prent && (
        <figure className="mt-8">
          <Image
            src={artikel.prent}
            alt={artikel.prentBronskrif ?? artikel.titel}
            width={1200}
            height={675}
            className="w-full rounded-sm border"
            priority
          />
          {artikel.prentBronskrif && (
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {artikel.prentBronskrif}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-8">
        <ArtikelInhoud inhoud={artikel.inhoud} />
      </div>

      <SatireDefinisie />
    </article>
  )
}
```

- [ ] **Step 3: Verify in the browser**

```bash
cd ~/DieTransvaler && npm run build && npm run dev
```

Visit `http://localhost:3000/artikel/eskom-lewenstyl-keuse`. Confirm the category tag is gold, the headline and body render, and the date reads as Afrikaans ("24 Augustus 2026"). Then visit `/artikel/bestaan-nie` and confirm a 404.

- [ ] **Step 4: Confirm the build statically generated every article**

The build output should list `/artikel/[slug]` as `SSG` with three prerendered paths. If it shows as dynamic, `generateStaticParams` is not being picked up — fix before continuing.

- [ ] **Step 5: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg artikelbladsy met MDX-uitvoer by"
```

---

## Task 6: Voorblad

**Files:**
- Create: `src/components/artikel-kaart.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getAlleArtikels`, `kategorieNaam`, `ArtikelMeta`; `<SatireDefinisie />` from Task 4.
- Produces: `<ArtikelKaart artikel={...} />`, reused by Task 7.

- [ ] **Step 1: Write `src/components/artikel-kaart.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { kategorieNaam, type ArtikelMeta } from '@/lib/inhoud'

export function ArtikelKaart({ artikel }: { artikel: ArtikelMeta }) {
  return (
    <article className="group border-t pt-5">
      <Link href={`/artikel/${artikel.slug}`} className="block">
        {artikel.prent && (
          <Image
            src={artikel.prent}
            alt={artikel.titel}
            width={600}
            height={338}
            className="mb-4 w-full rounded-sm border"
          />
        )}
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--merk-goud)' }}
        >
          {kategorieNaam(artikel.kategorie)}
        </span>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight group-hover:underline underline-offset-4">
          {artikel.titel}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{artikel.uittreksel}</p>
      </Link>
    </article>
  )
}
```

- [ ] **Step 2: Rewrite `src/app/page.tsx`**

The newest article becomes the lead; the rest fill a grid.

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArtikelKaart } from '@/components/artikel-kaart'
import { SatireDefinisie } from '@/components/satire-definisie'
import { getAlleArtikels, kategorieNaam } from '@/lib/inhoud'

export default async function Voorblad() {
  const artikels = await getAlleArtikels()

  if (artikels.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nog geen artikels nie. Die redaksie is by die koffiemasjien.
      </p>
    )
  }

  const [hoofberig, ...res] = artikels

  return (
    <div className="space-y-12">
      <article>
        <Link href={`/artikel/${hoofberig.slug}`} className="group block">
          {hoofberig.prent && (
            <Image
              src={hoofberig.prent}
              alt={hoofberig.titel}
              width={1200}
              height={675}
              className="mb-6 w-full rounded-sm border"
              priority
            />
          )}
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--merk-goud)' }}
          >
            {kategorieNaam(hoofberig.kategorie)}
          </span>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight group-hover:underline underline-offset-4">
            {hoofberig.titel}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {hoofberig.uittreksel}
          </p>
        </Link>
      </article>

      {res.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {res.map((artikel) => (
            <ArtikelKaart key={artikel.slug} artikel={artikel} />
          ))}
        </div>
      )}

      <SatireDefinisie />
    </div>
  )
}
```

- [ ] **Step 3: Verify in the browser**

```bash
cd ~/DieTransvaler && npm run dev
```

At `http://localhost:3000`, confirm the Eskom article is the lead (newest at 2026-08-24), the other two appear in the grid, and the layout holds at mobile width (resize to ~390px).

- [ ] **Step 4: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg voorblad met hoofberig en artikelrooster by"
```

---

## Task 7: Category pages

**Files:**
- Create: `src/app/kategorie/[kategorie]/page.tsx`

**Interfaces:**
- Consumes: `getArtikelsByKategorie`, `KATEGORIEE`, `kategorieNaam`, `ArtikelKaart`, `Kategorie`.
- Produces: statically generated routes at `/kategorie/[kategorie]`, one per category.

- [ ] **Step 1: Write `src/app/kategorie/[kategorie]/page.tsx`**

```tsx
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
          Nog niks onder {kategorieNaam(kategorie)} nie. Ons versin so vinnig ons kan.
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
```

The `isKategorie` type guard is what lets an arbitrary URL segment become a typed `Kategorie` — without it, `/kategorie/resepte` would reach `getArtikelsByKategorie` with an invalid value instead of 404ing.

- [ ] **Step 2: Verify in the browser**

```bash
cd ~/DieTransvaler && npm run dev
```

Check `/kategorie/politiek` (one article), `/kategorie/sport` (the empty-state copy), and `/kategorie/resepte` (404).

- [ ] **Step 3: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg kategoriebladsye met leëstaat by"
```

---

## Task 8: Oor ons, sitemap, robots

**Files:**
- Create: `src/app/oor-ons/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**
- Consumes: `getAlleArtikels`, `KATEGORIEE`.
- Produces: `/oor-ons`, `/sitemap.xml`, `/robots.txt`.

- [ ] **Step 1: Write `src/app/oor-ons/page.tsx`**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Oor ons',
  description: 'Die Transvaler is \'n satiriese publikasie. Alles hierin is versin.',
}

export default function OorOns() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Oor ons</h1>

      <p className="text-lg text-muted-foreground">
        Die Transvaler is 'n satiriese publikasie. Ons maak fopnuus — en ons sê dit
        vooraf, want dit is die enigste deel wat nie 'n grap is nie.
      </p>

      <div className="space-y-4 text-base leading-7">
        <p>
          Elke artikel op hierdie werf is versin. Die gebeure het nie plaasgevind
          nie, die aanhalings is nooit gesê nie, en die kenners bestaan nie.
        </p>
        <p>
          Ons skryf oor instellings en tipes — Eskom, munisipaliteite, komitees,
          en die ewige "Ons Politieke Redakteur". Ons skryf nie satire oor gewone
          mense by die naam nie.
        </p>
        <p>
          As jy 'n artikel hier lees en dit klink waar, is dit nie omdat dit waar
          is nie. Dit is omdat 2026 'n moeilike jaar is om te parodieer.
        </p>
      </div>

      <p className="border-t pt-6 text-sm text-muted-foreground">
        Foute, klagtes of 'n goeie idee?{' '}
        <a href="mailto:redaksie@dietransvaler.co.za" className="underline underline-offset-4">
          redaksie@dietransvaler.co.za
        </a>
      </p>
    </div>
  )
}
```

Note: `redaksie@dietransvaler.co.za` needs the domain added as a Resend sending domain before it can receive or send. That is out of scope for this plan — the address is a `mailto:` link only.

- [ ] **Step 2: Write `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { getAlleArtikels, KATEGORIEE } from '@/lib/inhoud'

const OORSPRONG = 'https://dietransvaler.co.za'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artikels = await getAlleArtikels()

  return [
    { url: OORSPRONG, changeFrequency: 'daily', priority: 1 },
    { url: `${OORSPRONG}/oor-ons`, changeFrequency: 'yearly', priority: 0.3 },
    ...KATEGORIEE.map((k) => ({
      url: `${OORSPRONG}/kategorie/${k.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
    ...artikels.map((a) => ({
      url: `${OORSPRONG}/artikel/${a.slug}`,
      lastModified: new Date(a.datum),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
```

- [ ] **Step 3: Write `src/app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://dietransvaler.co.za/sitemap.xml',
  }
}
```

- [ ] **Step 4: Verify**

```bash
cd ~/DieTransvaler && npm run build && npm run dev
```

Visit `/oor-ons`, `/sitemap.xml` (should list 3 articles + 5 categories + 2 pages = 10 URLs), and `/robots.txt`.

- [ ] **Step 5: Run the full check**

```bash
cd ~/DieTransvaler && npm test && npm run lint && npm run build
```

Expected: tests pass, lint clean, build succeeds with every route marked static.

- [ ] **Step 6: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg Oor ons-bladsy, sitemap en robots by"
```

---

## Task 9: Deploy to Vercel and attach the domain

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the finished app.
- Produces: a live site at `https://dietransvaler.co.za`.

- [ ] **Step 1: Write `README.md`**

```markdown
# Die Transvaler

Afrikaanse satiriese nuus — *fopnuus wat jy kan vertrou*. Live at
[dietransvaler.co.za](https://dietransvaler.co.za).

## 'n Nuwe artikel skryf

1. Create `content/artikels/<slug>.mdx`. The filename becomes the URL.
2. Fill in the frontmatter — every field except `prent` and `prentBronskrif`
   is required:

   ```yaml
   ---
   titel: "Die kop"
   uittreksel: "Een sin wat op die voorblad wys."
   kategorie: politiek   # politiek | sake | sport | wereld | lewe
   datum: 2026-08-24
   skrywer: "Ons Politieke Redakteur"
   prent: /prente/iets.jpg          # optioneel
   prentBronskrif: "Bronskrif."     # slegs saam met prent
   ---
   ```

3. Write the body in MDX. Commit and push — Vercel deploys automatically.

Bad frontmatter fails the build with the filename and field named, so a broken
article never reaches production.

## Ontwikkeling

```bash
npm run dev     # http://localhost:3000
npm test        # content-layer tests
npm run build   # verify everything still statically generates
```

## Redaksionele reël

Satiriseer instellings en tipes, nie gewone mense by die naam nie. Suid-Afrika
het geen parodie-verweer teen laster nie.
```

- [ ] **Step 2: Push to GitHub**

```bash
cd ~/DieTransvaler
gh repo create dietransvaler --private --source=. --remote=origin --push
```

- [ ] **Step 3: Create the Vercel project**

Use the Vercel MCP `create_git_project` tool with `teamId: team_5ksmrAQIoTpkIwFsW4mCf8yi` and the new repo. If the MCP project tools are still failing (they were on 2026-08-24), fall back to the dashboard or `npx vercel link`.

- [ ] **Step 4: Attach the domain**

`dietransvaler.co.za` is already registered at an external ZA registrar — Vercel's registrar does not carry `.za`, so nothing is purchased. Add the domain to the Vercel project, then at the registrar point:

- `dietransvaler.co.za` → `A` record to Vercel's apex IP (Vercel shows the exact value), and
- `www.dietransvaler.co.za` → `CNAME` to `cname.vercel-dns.com`

ZA DNS propagation is typically under an hour.

- [ ] **Step 5: Verify production**

Load `https://dietransvaler.co.za` and confirm: TLS is valid, the masthead renders, an article page loads, and the theme toggle persists across a reload.

- [ ] **Step 6: Commit**

```bash
cd ~/DieTransvaler
git add -A
git commit -m "Voeg README met redaksionele en ontwikkelingsnotas by"
git push
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Architecture / content-layer boundary | 2, 3 |
| Stack | 1 |
| Content model + validation | 2 |
| Content layer API | 3 |
| Routes (`/`, article, category, oor-ons, sitemap, robots) | 5, 6, 7, 8 |
| Visual design, colour exception, light default | 4 |
| Legal guardrails (FOPNUUS marker, disclaimer) | 4, 8 |
| Satire definition on articles + voorblad | 4 (component), 5 + 6 (placement) |
| Deployment + domain | 9 |
| Testing | 2, 3 |
| Non-goals | Nothing implements them — correct. |

**Placeholder scan:** No TBD/TODO. Every code step carries real code. The one forward reference — Resend setup for `redaksie@` — is explicitly marked out of scope rather than left as a vague task.

**Type consistency:** `ArtikelMeta`, `Artikel`, `Kategorie`, `KATEGORIEE`, `kategorieNaam`, `parseerArtikel`, `getAlleArtikels`, `getArtikelBySlug`, `getArtikelsByKategorie`, `getAlleSlugs` are defined in Tasks 2–3 and used with matching signatures in Tasks 4–8. Listing functions return `ArtikelMeta` (no `inhoud`); only `getArtikelBySlug` returns `Artikel`, and only Task 5 reads `.inhoud`.

**One deviation from the spec, recorded deliberately:** the spec said routes must not import `next-mdx-remote`. This plan confines `MDXRemote` to `src/components/artikel-inhoud.tsx` instead, since MDX rendering is presentation rather than data access. The boundary the spec actually protects — routes never touching `fs` or `gray-matter` — is fully preserved.
