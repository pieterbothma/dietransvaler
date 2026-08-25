/**
 * The paper's masthead. Printed in the footer colophon, the way a real paper
 * prints who made it.
 *
 * Bylines in article frontmatter should use a `naam` from this list, so the
 * colophon and the articles never disagree about who works here.
 */
export const REDAKSIE = [
  { naam: 'Jurie Nalis', rol: 'Sport' },
  { naam: 'Sakkie Rekening', rol: 'Sake' },
  { naam: 'Koos Respondent', rol: 'Politiek' },
  { naam: 'Flash Potgieter', rol: 'Fotografie' },
] as const
