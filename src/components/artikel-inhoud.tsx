import { MDXRemote } from 'next-mdx-remote/rsc'

export function ArtikelInhoud({ inhoud }: { inhoud: string }) {
  return (
    <div className="space-y-4 text-base leading-7 [&>p]:text-foreground/90">
      <MDXRemote source={inhoud} />
    </div>
  )
}
