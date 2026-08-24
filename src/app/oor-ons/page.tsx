import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Oor ons',
  description: 'Die Transvaler is \'n satiriese publikasie. Alles hierin is versin.',
}

export default function OorOns() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Oor ons</h1>

      <p className="text-lg text-foreground">
        Die Transvaler is 'n satiriese publikasie. Ons maak fopnuus — en ons sê dit
        vooraf, want dit is die enigste deel wat nie 'n grap is nie.
      </p>

      <div className="space-y-4 text-base leading-7">
        <p>
          Elke artikel op hierdie werf is versin. Die gebeure het nie plaasgevind
          nie, die aanhalings is nooit gesê nie, en die kenners bestaan nie.
        </p>
        <p>
          Ons skryf oor instellings en tipes — Eskom, munisipaliteite, komitees,
          en die ewige "Ons Politieke Redakteur". Ons skryf nie satire oor gewone
          mense by naam nie.
        </p>
        <p>
          As jy 'n artikel hier lees en dit klink waar, is dit nie omdat dit waar
          is nie. Dit is omdat 2026 'n moeilike jaar is om te parodieer.
        </p>
      </div>

      <p className="border-t pt-6 text-sm text-muted-foreground">
        Foute, klagtes of 'n goeie idee?{' '}
        <a href="mailto:redaksie@dietransvaler.co.za" className="underline underline-offset-4">
          redaksie@dietransvaler.co.za
        </a>
      </p>
    </div>
  )
}
