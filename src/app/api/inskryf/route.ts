import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Newsletter sign-up. Adds the address to a Resend audience.
 *
 * The rest of the site is statically generated; this is the one server-side
 * route. It needs two environment variables, and fails loudly rather than
 * silently swallowing addresses if either is missing:
 *
 *   RESEND_API_KEY       — from resend.com
 *   RESEND_AUDIENCE_ID   — the audience to add contacts to
 */
const inskrywing = z.object({
  epos: z.string().email(),
  // Honeypot: a real person never fills this in because it is hidden. Bots do.
  // Accept ANY value here — rejecting it in the schema would 400 before the
  // check below runs, which both hides the bot signal and tells the bot it was
  // caught. Discard silently instead.
  vangput: z.string().optional(),
})

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

  const sleutel = process.env.RESEND_API_KEY
  const gehoor = process.env.RESEND_AUDIENCE_ID
  if (!sleutel || !gehoor) {
    console.error(
      'Inskryf: RESEND_API_KEY or RESEND_AUDIENCE_ID is not set — the address was NOT saved.',
    )
    return NextResponse.json(
      { fout: 'Inskrywings is tydelik af. Probeer later weer.' },
      { status: 503 },
    )
  }

  const antwoord = await fetch(
    `https://api.resend.com/audiences/${gehoor}/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sleutel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: resultaat.data.epos,
        unsubscribed: false,
      }),
    },
  )

  if (!antwoord.ok) {
    console.error('Inskryf: Resend returned', antwoord.status, await antwoord.text())
    return NextResponse.json(
      { fout: 'Iets het verkeerd geloop. Probeer weer.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
