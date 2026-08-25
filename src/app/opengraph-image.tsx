import { getAlleArtikels } from '@/lib/inhoud'
import { ogKaart, OG_GROOTTE, OG_TIPE } from '@/lib/og'

export const alt = 'Die Transvaler — fopnuus wat jy kan vertrou'
export const size = OG_GROOTTE
export const contentType = OG_TIPE

/**
 * The voorblad shares whatever is currently the lead story, so the card always
 * matches what a visitor actually lands on.
 */
export default async function Image() {
  const artikels = await getAlleArtikels()
  const lopend = artikels.filter((a) => !a.staande)
  const hoof = lopend.find((a) => a.hoofberig) ?? lopend[0]
  return ogKaart(hoof)
}
