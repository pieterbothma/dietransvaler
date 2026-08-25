import { describe, expect, it } from 'vitest'
import { parseerArtikel } from '@/lib/inhoud/skema'

const GELDIG = `---
titel: "Eskom kondig aan beurtkrag is nou 'n lewenstyl-keuse"
uittreksel: "Verbruikers kan voortaan kies tussen Fase 2 en Fase 6."
kategorie: politiek
datum: 2026-08-24
skrywer: "Ons Politieke Redakteur"
prent: /prente/eskom.jpg
prentAlt: "'n Eskom-substasie in mis, met 'n bord wat 'Lewenstyl-sentrum' lees."
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

  it('parses an article with prent, prentAlt, and prentBronskrif, round-tripping prentAlt', () => {
    const artikel = parseerArtikel(GELDIG, 'eskom-lewenstyl')
    expect(artikel.prentAlt).toBe(
      "'n Eskom-substasie in mis, met 'n bord wat 'Lewenstyl-sentrum' lees.",
    )
  })

  it('rejects prent without prentAlt', () => {
    const weesAlt = `---
titel: "Kop"
uittreksel: "Iets"
kategorie: sake
datum: 2026-08-20
skrywer: "Ons Sakeredakteur"
prent: /prente/kop.jpg
---

Body.
`
    expect(() => parseerArtikel(weesAlt, 'wees-alt')).toThrowError(/prentAlt/)
  })
})

describe('staande berigte', () => {
  it('accepts a standing story flag', () => {
    const staande = `---
titel: "Kop"
uittreksel: "Iets"
kategorie: politiek
datum: 2026-08-20
skrywer: "Tieties Prinsloo"
staande: true
---

Body.
`
    expect(parseerArtikel(staande, 'staan').staande).toBe(true)
  })

  it('leaves staande undefined when not set', () => {
    const gewoon = `---
titel: "Kop"
uittreksel: "Iets"
kategorie: politiek
datum: 2026-08-20
skrywer: "Tieties Prinsloo"
---

Body.
`
    expect(parseerArtikel(gewoon, 'gewoon').staande).toBeUndefined()
  })
})
