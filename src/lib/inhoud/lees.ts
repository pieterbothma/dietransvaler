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
