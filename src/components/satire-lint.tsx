/**
 * The satire definition as a scrolling ticker beneath the nav.
 *
 * This is the site's primary legal marker, so it renders on every route rather
 * than only on articles and the voorblad. The copy is fixed — do not reword it.
 *
 * Motion: the track holds two copies of the text, so translating by -50% lands
 * exactly on the second copy and the loop is seamless. It pauses on hover and
 * on keyboard focus. Under `prefers-reduced-motion` the animation stops, the
 * duplicate is dropped, and the text wraps normally — a disclaimer a reader
 * cannot stop to read is not a disclaimer.
 *
 * The spans are `inline` rather than flex on purpose: a flex child with
 * `shrink-0` refuses to wrap, which silently clips the definition under
 * reduced motion.
 */
export function SatireLint() {
  const teks = (
    <>
      <span className="font-semibold">satire</span>{' '}
      <span className="italic">s.nw.</span>{' '}
      die gebruik van humor, ironie, oordrywing of bespotting om mense se
      onnoselheid bloot te lê en te kritiseer, veral in die konteks van
      kontemporêre politiek en ander aktuele kwessies.
    </>
  )

  return (
    <div
      className="group border-b border-black/10 bg-merk-goud-helder text-black"
      role="note"
      aria-label="Wat satire beteken"
      tabIndex={0}
    >
      <div className="mx-auto max-w-5xl overflow-hidden px-6 py-2 motion-reduce:overflow-visible">
        <p className="w-max animate-satire-lint whitespace-nowrap text-xs leading-5 text-black group-hover:[animation-play-state:paused] group-focus:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:whitespace-normal">
          <span className="pr-24">{teks}</span>
          {/* Duplicate makes the loop seamless. Hidden from assistive tech so the
              definition is not announced twice, and dropped under reduced motion. */}
          <span aria-hidden className="pr-24 motion-reduce:hidden">
            {teks}
          </span>
        </p>
      </div>
    </div>
  )
}
