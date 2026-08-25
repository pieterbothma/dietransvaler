/**
 * Print every collected sign-up as CSV.
 *
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/lees-inskrywings.ts > inskrywings.csv
 *
 * Addresses are stored one blob per person, named by a hash of the address.
 * The blobs are private, so they are read with `get()` — a plain fetch of the
 * download URL is unauthenticated and comes back as an error page, not JSON.
 */
import { get, list } from '@vercel/blob'

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set.')
    process.exit(1)
  }

  let cursor: string | undefined
  const rye: string[] = []

  do {
    const bladsy = await list({ prefix: 'inskrywings/', cursor, limit: 1000 })
    for (const blob of bladsy.blobs) {
      const { stream } = await get(blob.pathname, { access: 'private' })
      const teks = await new Response(stream).text()
      const { epos, datum } = JSON.parse(teks) as { epos: string; datum: string }
      rye.push(`${epos},${datum}`)
    }
    cursor = bladsy.hasMore ? bladsy.cursor : undefined
  } while (cursor)

  console.log('epos,datum')
  for (const ry of rye.sort()) console.log(ry)
  console.error(`\n${rye.length} inskrywings`)
}

main().catch((fout) => {
  console.error(fout)
  process.exit(1)
})
