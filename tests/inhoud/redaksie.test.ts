import { describe, expect, it } from 'vitest'
import { getAlleArtikels } from '@/lib/inhoud/lees'
import { REDAKSIE } from '@/lib/redaksie'

const NAME = REDAKSIE.map((lid) => lid.naam)

describe('redaksie', () => {
  it('has no duplicate names', () => {
    expect(new Set(NAME).size).toBe(NAME.length)
  })

  it('credits every article to someone on the masthead', async () => {
    // The footer colophon is generated from REDAKSIE. A byline that is not on
    // that list means the paper is publishing someone it does not employ —
    // usually a typo or a renamed staffer whose articles were not updated.
    const artikels = await getAlleArtikels()
    const wees = artikels
      .filter((a) => !NAME.includes(a.skrywer as (typeof NAME)[number]))
      .map((a) => `${a.slug}: "${a.skrywer}"`)

    expect(wees).toEqual([])
  })
})
