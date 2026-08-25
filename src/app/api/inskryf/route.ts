import { createHash } from 'node:crypto'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Newsletter sign-up. The rest of the site is statically generated; this is the
 * one server-side route.
 *
 * Two sinks, both optional, and at least one must be configured:
 *
 *   BLOB_READ_WRITE_TOKEN  — Vercel Blob. Auto-injected when you create a Blob
 *                            store on the project. The durable record.
 *   RESEND_API_KEY         — Resend, plus RESEND_AUDIENCE_ID. The mailing list.
 *
 * Blob is written whenever it is configured, even once Resend is live, so there
 * is always a copy that does not depend on a third party. A sign-up counts as
 * saved if EITHER sink accepted it; it only fails if every configured sink did.
 */
const inskrywing = z.object({
  epos: z.string().email(),
  // Honeypot: a real person never fills this in because it is hidden. Bots do.
  // Accept ANY value here — rejecting it in the schema would 400 before the
  // check below runs, which both hides the bot signal and tells the bot it was
  // caught. Discard silently instead.
  vangput: z.string().optional(),
})

/**
 * One blob per address, named by a hash of the address itself.
 *
 * Two reasons, both deliberate. A single growing list blob would need
 * read-modify-write, which loses sign-ups when two arrive at once. And hashing
 * the address means the same person signing up twice overwrites their own entry
 * — free deduplication — without the address appearing in the pathname.
 */
async function stoorInBlob(epos: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false
  const sleutel = createHash('sha256').update(epos.toLowerCase()).digest('hex')
  await put(
    `inskrywings/${sleutel}.json`,
    JSON.stringify({ epos, datum: new Date().toISOString() }),
    {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    },
  )
  return true
}

async function stoorInResend(epos: string): Promise<boolean> {
  const sleutel = process.env.RESEND_API_KEY
  const gehoor = process.env.RESEND_AUDIENCE_ID
  if (!sleutel || !gehoor) return false

  const antwoord = await fetch(
    `https://api.resend.com/audiences/${gehoor}/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sleutel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: epos, unsubscribed: false }),
    },
  )
  if (!antwoord.ok) {
    console.error('Inskryf: Resend returned', antwoord.status, await antwoord.text())
    return false
  }
  return true
}

export async function POST(request: Request) {
  let data: unknown
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldige versoek.' }, { status: 400 })
  }

  const resultaat = inskrywing.safeParse(data)
  if (!resultaat.success) {
    return NextResponse.json(
      { fout: 'Daardie e-posadres lyk nie reg nie.' },
      { status: 400 },
    )
  }

  // A filled honeypot means a bot. Return success so it learns nothing.
  if (resultaat.data.vangput) {
    return NextResponse.json({ ok: true })
  }

  const { epos } = resultaat.data
  const uitkomste = await Promise.allSettled([
    stoorInBlob(epos),
    stoorInResend(epos),
  ])

  for (const uitkoms of uitkomste) {
    if (uitkoms.status === 'rejected') {
      console.error('Inskryf: sink threw —', uitkoms.reason)
    }
  }

  const gestoor = uitkomste.some((u) => u.status === 'fulfilled' && u.value)
  if (!gestoor) {
    console.error(
      'Inskryf: nothing was stored. Set BLOB_READ_WRITE_TOKEN (create a Blob store) or RESEND_API_KEY + RESEND_AUDIENCE_ID.',
    )
    return NextResponse.json(
      { fout: 'Inskrywings is tydelik af. Probeer later weer.' },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}
