import Link from 'next/link'

export default function NieGevindNie() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Bladsy nie gevind nie</h1>
      <p className="text-lg text-muted-foreground">
        Hierdie storie het ons nie eens versin nie.
      </p>
      <p>
        <Link href="/" className="underline underline-offset-4">
          Terug na die voorblad
        </Link>
      </p>
    </div>
  )
}
