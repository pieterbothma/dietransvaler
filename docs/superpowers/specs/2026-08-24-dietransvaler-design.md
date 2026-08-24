# Die Transvaler — Design

**Date:** 2026-08-24
**Status:** Proposed — awaiting review before an implementation plan is written
**Domain:** dietransvaler.co.za (already registered, external ZA registrar)

## 1. What this is

An Afrikaans satirical news site — *fopnuus wat jy kan vertrou*. Piet writes
every article himself. The site presents them in the visual language of a
straight modern news site, because the humour lives entirely in the copy; the
design's job is to play it deadpan, not to signal "joke".

The name references the real *Die Transvaler* (1937–1983). The masthead logo is
green + gold with a mielie.

## 2. Non-goals

Deliberately excluded from v1. Each is a "when we actually miss it" item, not a
"phase 2 promise":

- No database, no Supabase, no auth, no admin UI.
- No AI-generated article text. Piet writes the articles.
- No search, no RSS, no comments, no newsletter.
- No user accounts, no analytics beyond Vercel's.
- No i18n. The site is Afrikaans only.

## 3. Architecture

A single Next.js 16 App Router application, statically generated in full. There
is no server-side runtime beyond what Next needs to build; every route is HTML
on Vercel's edge.

```
~/DieTransvaler
├── content/artikels/*.mdx      # the articles — the only thing Piet edits to publish
├── public/prente/              # article images
├── src/
│   ├── app/                    # routes; never touches the filesystem
│   ├── components/             # presentation
│   └── lib/inhoud/             # THE CONTENT LAYER — the only fs consumer
└── docs/superpowers/specs/
```

### The content layer is the load-bearing boundary

`src/lib/inhoud/` is the only code in the project that knows articles are MDX
files on disk. Route components ask it for *"the latest articles"* or *"this
slug"* and receive plain typed objects.

This matters because the one accepted weakness of the file-based choice is that
publishing requires a git commit — Piet cannot post from his phone. If that ever
becomes intolerable, the fix is to reimplement the content layer against
Supabase while every page component stays untouched. That escape hatch only
exists if the boundary is real, so: **no route may import `fs`, `gray-matter`,
or `next-mdx-remote` directly.**

### Stack

Matches `~/one-man-band` so there is one house stack, not two:

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind v4, shadcn/ui |
| Theming | `next-themes` |
| Fonts | Geist via `next/font` |
| Validation | zod (already house standard) |
| Testing | vitest |
| Analytics | `@vercel/analytics` |

Two new dependencies only:

- **`gray-matter`** — frontmatter parsing.
- **`next-mdx-remote`** — MDX compiled in a React Server Component.

Contentlayer and content-collections were considered and rejected: they add a
build-step dependency and their type-generation payoff does not justify itself
at this article count. zod validation covers the same safety need with a
dependency already in the stack.

## 4. Content model

One article per `.mdx` file in `content/artikels/`. The filename is the slug —
`eskom-lewenstyl-keuse.mdx` serves at `/artikel/eskom-lewenstyl-keuse`.

```yaml
---
titel: "Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse"
uittreksel: "Verbruikers kan voortaan kies tussen Fase 2 en Fase 6."
kategorie: politiek
datum: 2026-08-24
skrywer: "Ons Politieke Redakteur"
prent: /prente/eskom-lewenstyl.jpg
prentAlt: "'n Kragpaal teen 'n leë aandhemel."
prentBronskrif: "'n Argieffoto wat niks bewys nie."
---

Body copy in MDX.
```

Field names are Afrikaans because they are part of the authoring surface Piet
works in daily. Code, types, comments and commit messages for this repo stay
English per house convention; the frontmatter keys are the deliberate exception.

### Types

```ts
type Kategorie = 'politiek' | 'sake' | 'sport' | 'wereld' | 'lewe'

interface ArtikelMeta {
  slug: string
  titel: string
  uittreksel: string
  kategorie: Kategorie
  datum: string          // ISO 8601 date, e.g. "2026-08-24"
  skrywer: string
  prent?: string
  /** What the image depicts — the accessible description. */
  prentAlt?: string
  /** Who or what the image is credited to — displayed as a caption. */
  prentBronskrif?: string
}

interface Artikel extends ArtikelMeta {
  inhoud: string         // raw MDX body, compiled at render time
}
```

An article may have no image at all. But the three image fields are bound by two
rules, both enforced by the schema:

- `prentBronskrif` without `prent` is invalid — a credit for a nonexistent image.
- **`prent` without `prentAlt` is invalid** — an image with no accessible
  description.

`prentAlt` and `prentBronskrif` are deliberately separate fields rather than one.
A caption credits the image ("'n Argieffoto wat niks bewys nie"); alt text
describes what it depicts. Reusing a caption as alt text announces the same
string twice to a screen reader while describing nothing — an anti-pattern this
schema makes structurally impossible rather than merely discouraged.

> **Added 2026-08-24.** The original design had only `prent` and
> `prentBronskrif`, and the article page used the caption as alt text with the
> headline as a fallback. A task review caught it. Corrected before any article
> set an image, so no content needed rewriting.

### Validation

Frontmatter is parsed with `gray-matter` and validated with a zod schema. **A
malformed or incomplete file fails the build with a message naming the file and
the offending field.** Failing loudly at build time is preferable to a
half-rendered article reaching production, and since publishing is already a
commit-and-deploy cycle, the feedback arrives before anyone sees it.

Category slugs are ASCII for URL safety; display names carry the diacritics:

| Slug | Display |
|---|---|
| `politiek` | Politiek |
| `sake` | Sake |
| `sport` | Sport |
| `wereld` | Wêreld |
| `lewe` | Lewe |

## 5. Content layer API

`src/lib/inhoud/` exposes exactly this surface:

```ts
getAlleArtikels(): Promise<ArtikelMeta[]>              // newest first
getArtikelBySlug(slug: string): Promise<Artikel | null>
getArtikelsByKategorie(k: Kategorie): Promise<ArtikelMeta[]>  // newest first
getAlleSlugs(): Promise<string[]>                      // for generateStaticParams
KATEGORIEE: readonly { slug: Kategorie; naam: string }[]
```

List functions return `ArtikelMeta` (no body) so listing pages never load article
bodies they will not render. Only `getArtikelBySlug` returns `inhoud`.

Ties on `datum` break by slug, so ordering is deterministic across builds.

## 6. Routes

| Route | Purpose | Generation |
|---|---|---|
| `/` | Voorblad: lead story + grid of recent articles | Static |
| `/artikel/[slug]` | The article | Static via `generateStaticParams` |
| `/kategorie/[kategorie]` | Section index | Static, one per category |
| `/oor-ons` | About + satire disclaimer | Static |

Also: `sitemap.xml` and `robots.txt` via Next's metadata conventions, and
per-article OpenGraph tags built against `https://dietransvaler.co.za`.

A missing slug renders `not-found`. An empty category renders an explicit empty
state, not a blank grid.

## 7. Visual design

Modern news site, played straight. Clean sans (Geist), tight leading, generous
whitespace, hairline borders. No gradients, no glow, no glassmorphism.

**Colour is a scoped exception to the strictly-monochrome house rule.** The logo's
green and gold appear in the masthead and category tags only. Every other
surface is monochrome. This is recorded here rather than left implicit so it is
a decision, not a drift.

**Light mode is the default**, with dark mode available — a second deliberate
departure from dark-mode-first, on the grounds that news is read in light. Both
themes ship properly built; neither is an afterthought.

Article images live in `public/prente/`, served through `next/image`, and are
generated with the `nano-banana` skill (Gemini image generation) rather than
sourced from stock.

## 8. Editorial and legal guardrails

A satire site built to look like real news is precisely the thing that attracts
a defamation claim, and South Africa offers no fair-use or parody defence to
fall back on. Three mitigations, all structural:

1. **A persistent "FOPNUUS" marker** in the masthead and the footer of every
   page, plus a plain-language disclaimer on `/oor-ons`. This is on-brand — the
   tagline is already *fopnuus wat jy kan vertrou* — so it costs nothing
   editorially.

2. **The satire definition, rendered as a dictionary entry**, at the foot of
   every article and the voorblad. Verbatim copy:

   > **satire** · *s.nw.*
   >
   > die gebruik van humor, ironie, oordrywing of bespotting om mense se
   > onnoselheid bloot te lê en te kritiseer, veral in die konteks van
   > kontemporêre politiek en ander aktuele kwessies.

   Placement is deliberate. A disclaimer adjacent to the content a reader just
   finished is a materially stronger position than one buried in a site footer,
   because the test that matters is whether a reasonable reader would understand
   the piece as fact. Rendering it as a lexicographic entry — headword, part of
   speech, definition — also keeps it in voice: it is the same deadpan register
   the articles are written in, so it reads as part of the publication rather
   than as legal boilerplate bolted on.

   This copy is fixed. It is not a placeholder to be reworded during
   implementation.

3. **Target institutions and archetypes, not named private individuals.** Eskom,
   municipalities, "Ons Politieke Redakteur". This is an editorial convention
   rather than something code can enforce, and it is recorded here as the
   project's standing rule.

## 9. Deployment

Vercel project, git-linked, in the `Piet` team (`team_5ksmrAQIoTpkIwFsW4mCf8yi`).

`dietransvaler.co.za` is already registered at an external ZA registrar —
Vercel's registrar does not carry the `.za` namespace, so the domain is added to
the Vercel project and pointed there by DNS. Nothing is purchased through
Vercel.

The site is fully static, so hosting cost is effectively nil and there are no
cold starts.

## 10. Testing

vitest against the content layer, which is where the only real logic lives:

- Frontmatter parses into `ArtikelMeta` correctly.
- Slug derives from filename.
- `getAlleArtikels` sorts newest first, with deterministic tie-breaking.
- `getArtikelsByKategorie` filters correctly and returns `[]` for an empty category.
- `getArtikelBySlug` returns `null` for an unknown slug.
- Malformed frontmatter (missing required field, unknown category, `prentBronskrif`
  without `prent`) fails with a message naming the file.

Route components are thin enough that unit tests would test React rather than
this project; they are verified in a real browser instead, per the
`verify-frontend-change` skill.

## 11. Deferred

Recorded so they are choices rather than oversights: search, RSS, newsletter
signup, comments, an author archive, and moving the content layer to Supabase to
allow publishing from a phone.
