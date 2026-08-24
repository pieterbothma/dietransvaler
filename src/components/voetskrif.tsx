import Link from 'next/link'

export function Voetskrif() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-5xl space-y-2 px-6 py-8 text-sm text-muted-foreground">
        <p className="font-semibold uppercase tracking-widest text-[10px]">
          Fopnuus
        </p>
        <p>
          Die Transvaler is 'n satiriese publikasie. Alle artikels is versinsels.
          Enige ooreenkoms met werklike gebeure is opsetlik, maar die gebeure self
          is dit nie.
        </p>
        <p>
          <Link href="/oor-ons" className="underline underline-offset-4">
            Oor ons
          </Link>
        </p>
      </div>
    </footer>
  )
}
