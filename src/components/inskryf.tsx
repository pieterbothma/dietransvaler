'use client'

import { useId, useState } from 'react'

type Stand = 'wag' | 'stuur' | 'klaar' | 'fout'

/**
 * Newsletter sign-up strip. Sits under every article and at the foot of the
 * voorblad.
 *
 * Status is announced through an `aria-live` region so a screen-reader user
 * hears the result — a visual-only confirmation would leave them unsure whether
 * the form did anything.
 */
export function Inskryf() {
  const eposId = useId()
  const [epos, setEpos] = useState('')
  const [stand, setStand] = useState<Stand>('wag')
  const [boodskap, setBoodskap] = useState('')

  async function stuur(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStand('stuur')

    const vorm = new FormData(event.currentTarget)
    try {
      const antwoord = await fetch('/api/inskryf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epos, vangput: vorm.get('vangput') ?? '' }),
      })
      const data = await antwoord.json()
      if (!antwoord.ok) {
        setStand('fout')
        setBoodskap(data.fout ?? 'Iets het verkeerd geloop. Probeer weer.')
        return
      }
      setStand('klaar')
      setBoodskap('Dankie. Jy is op die lys.')
      setEpos('')
    } catch {
      setStand('fout')
      setBoodskap('Kon nie deurkom nie. Kyk jou verbinding en probeer weer.')
    }
  }

  return (
    <section
      aria-labelledby={`${eposId}-kop`}
      className="mt-16 rounded-sm border border-dashed p-6"
    >
      <h2
        id={`${eposId}-kop`}
        className="text-lg font-bold tracking-tight text-foreground"
      >
        Kry Brekende Nuus via E-pos
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ons stuur dit sodra ons dit versin het.
      </p>

      <form onSubmit={stuur} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor={eposId} className="sr-only">
          Jou e-posadres
        </label>
        <input
          id={eposId}
          name="epos"
          type="email"
          required
          autoComplete="email"
          value={epos}
          onChange={(e) => setEpos(e.target.value)}
          placeholder="jou@epos.co.za"
          disabled={stand === 'stuur'}
          className="w-full rounded-sm border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-60 sm:max-w-xs"
        />

        {/* Honeypot. Hidden from sight and from assistive tech, and skipped in
            the tab order — only a bot ever fills it in. */}
        <div aria-hidden className="hidden">
          <label htmlFor={`${eposId}-vangput`}>Los hierdie leeg</label>
          <input
            id={`${eposId}-vangput`}
            name="vangput"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={stand === 'stuur'}
          className="shrink-0 rounded-sm bg-merk-groen-band px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-60"
        >
          {stand === 'stuur' ? 'Stuur…' : 'Skryf in'}
        </button>
      </form>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-foreground">
        {boodskap}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Ons stuur net die nuusbrief. Jy kan enige tyd uitteken.
      </p>
    </section>
  )
}
