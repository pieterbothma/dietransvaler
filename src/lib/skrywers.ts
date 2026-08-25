/**
 * Byline portraits, keyed by the `skrywer` value in an article's frontmatter.
 *
 * An author without an entry here simply renders without a portrait — the map is
 * deliberately explicit rather than deriving a path from the name, so a missing
 * file can never produce a broken image on a live page.
 */
const PORTRETTE: Record<string, string> = {
  'Jurie Nalis': '/skrywers/jurie-nalis.png',
}

export function skrywerPortret(skrywer: string): string | undefined {
  return PORTRETTE[skrywer]
}
