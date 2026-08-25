import fs from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { kategorieNaam, type ArtikelMeta } from '@/lib/inhoud'

export const OG_GROOTTE = { width: 1200, height: 630 }
export const OG_TIPE = 'image/png'

const MERK_GROEN = '#2d6a4f'
const MERK_GOUD = '#e8b93f'

/**
 * Fonts are read off disk rather than fetched. satori downloads a font per
 * render when a glyph is missing, and Afrikaans is full of ê/ë/ô — bundling the
 * file makes coverage a build-time fact instead of a network gamble.
 */
async function lettertipes() {
  const gids = path.join(process.cwd(), 'src/assets/fonts')
  const [gewoon, vet] = await Promise.all([
    fs.readFile(path.join(gids, 'Geist-Regular.ttf')),
    fs.readFile(path.join(gids, 'Geist-Bold.ttf')),
  ])
  return [
    { name: 'Geist', data: gewoon, weight: 400 as const, style: 'normal' as const },
    { name: 'Geist', data: vet, weight: 700 as const, style: 'normal' as const },
  ]
}

/** Inline the photo as a data URL — no network fetch, works at build time. */
async function prentData(prent?: string): Promise<string | undefined> {
  if (!prent) return undefined
  try {
    const lêer = path.join(process.cwd(), 'public', prent.replace(/^\//, ''))
    const rou = await fs.readFile(lêer)
    const tipe = lêer.endsWith('.png') ? 'image/png' : 'image/jpeg'
    return `data:${tipe};base64,${rou.toString('base64')}`
  } catch {
    return undefined
  }
}

/** Long headlines get a smaller size so they still fit the panel. */
function kopGrootte(titel: string): number {
  if (titel.length > 78) return 44
  if (titel.length > 54) return 52
  return 62
}

/**
 * The share card. Uses the site's own structural colour language: green band on
 * top, gold band beneath, photo to the right.
 *
 * Every element sets `display: 'flex'` explicitly and no fragments are used —
 * satori does not implement the full CSS box model, and a fragment or a missing
 * display silently collapses the layout.
 */
export async function ogKaart(artikel: ArtikelMeta) {
  const [fonts, prent] = await Promise.all([
    lettertipes(),
    prentData(artikel.prent),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          fontFamily: 'Geist',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: MERK_GROEN,
            padding: '18px 56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.16em',
            }}
          >
            DIE TRANSVALER
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: prent ? 1.15 : 1,
              padding: '48px 56px',
            }}
          >
            <div
              style={{
                display: 'flex',
                color: '#6b6b6b',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.18em',
              }}
            >
              {kategorieNaam(artikel.kategorie).toUpperCase()}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 20,
                color: '#0a0a0a',
                fontSize: kopGrootte(artikel.titel),
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {artikel.titel}
            </div>
          </div>

          {prent && (
            <div style={{ display: 'flex', flex: 1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prent}
                alt=""
                width={560}
                height={470}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: MERK_GOUD,
            padding: '16px 56px',
          }}
        >
          <div style={{ display: 'flex', color: '#000000', fontSize: 22, fontWeight: 700 }}>
            fopnuus wat jy kan vertrou
          </div>
        </div>
      </div>
    ),
    { ...OG_GROOTTE, fonts },
  )
}
