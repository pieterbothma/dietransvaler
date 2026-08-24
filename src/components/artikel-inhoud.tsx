import { MDXRemote } from 'next-mdx-remote/rsc'

// Article bodies must not use `#` (h1) — the page's own <h1> is the headline,
// and a second h1 from MDX would silently break that rule. `##`/`###` (h2/h3)
// are fine and styled below.
export function ArtikelInhoud({ inhoud }: { inhoud: string }) {
  return (
    <div
      className="space-y-4 text-base leading-7 [&>p]:text-foreground/90
        [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-foreground
        [&>h3]:mt-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:tracking-tight [&>h3]:text-foreground
        [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6
        [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-6
        [&_li]:text-foreground/90
        [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-foreground
        [&>blockquote]:border-l-2 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-foreground/90
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_em]:italic"
    >
      <MDXRemote source={inhoud} />
    </div>
  )
}
