/**
 * The paper's masthead. Printed in the footer colophon, the way a real paper
 * prints who made it. Editor first, then the beats, then photography.
 *
 * Bylines in article frontmatter must use a `naam` from this list, so the
 * colophon and the articles never disagree about who works here.
 */
export const REDAKSIE = [
  { naam: 'Jurie Nalis', rol: 'Redakteur' },
  { naam: 'Sakkie Kleingeld', rol: 'Sake' },
  { naam: 'Tieties Prinsloo', rol: 'Politiek' },
  { naam: 'Flash Potgieter', rol: 'Fotografie' },
] as const
