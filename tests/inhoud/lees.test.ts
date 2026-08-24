import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getAlleArtikels,
  getAlleSlugs,
  getArtikelBySlug,
  getArtikelsByKategorie,
} from '@/lib/inhoud/lees'

const GIDS = path.join(process.cwd(), 'tests/fixtures/artikels')
const STUKKEND_GIDS = path.join(process.cwd(), 'tests/fixtures/stukkend')

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

  it('rejects rather than returning null when frontmatter is malformed', async () => {
    await expect(getArtikelBySlug('stukkende-frontmatter', STUKKEND_GIDS)).rejects.toThrow(
      /stukkende-frontmatter\.mdx/,
    )
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
