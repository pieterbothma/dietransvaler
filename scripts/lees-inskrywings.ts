/**
 * Print every collected sign-up as CSV.
 *
 *   BLOB_READ_WRITE_TOKEN=... npx tsx scripts/lees-inskrywings.ts > inskrywings.csv
 *
 * Pull the token from the Vercel project with `vercel env pull`, or copy it from
 * the Blob store's settings. Addresses are stored one blob per person, named by
 * a hash of the address, so this lists and fetches each one.
 */
import { list, head } from '@vercel/blob'

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set.')
    process.exit(1)
  }

  let cursor: string | undefined
  const rye: string[] = []

  do {
    const blobs = await list({ prefix: 'inskrywings/', cursor, limit: 1000 })
    for (const blob of blobs.blobs) {
      const inligting = await head(blob.url)
      const antwoord = await fetch(inligting.downloadUrl)
      const { epos, datum } = (await antwoord.json()) as {
        epos: string
        datum: string
      }
      rye.push(`${epos},${datum}`)
    }
    cursor = blobs.hasMore ? blobs.cursor : undefined
  } while (cursor)

  console.log('epos,datum')
  for (const ry of rye.sort()) console.log(ry)
  console.error(`\n${rye.length} inskrywings`)
}

main().catch((fout) => {
  console.error(fout)
  process.exit(1)
})
