/**
 * Merge local server/src/data/users.json with the db_users tab on Google Sheets,
 * then write back (local wins on same id). Queues a full mirror to the Sheet.
 *
 * Run from repo: cd server && npm run sync:users:merge
 * Requires GOOGLE_SHEETS_SPREADSHEET_ID + service account in .env
 */
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const USERS_PATH = resolve(__dirname, '../src/data/users.json')

const { readJsonSync, writeJsonSync, readJsonFromSheetTab, flushSheetMirrorQueue } = await import(
  '../src/services/sheetsJsonStore.js'
)

function mergeUsers(sheetUsers, localUsers) {
  const a = Array.isArray(sheetUsers) ? sheetUsers : []
  const b = Array.isArray(localUsers) ? localUsers : []
  const byId = new Map()
  for (const u of a) {
    if (u && u.id) byId.set(u.id, { ...u })
  }
  for (const u of b) {
    if (!u || !u.id) continue
    const prev = byId.get(u.id)
    byId.set(u.id, prev ? { ...prev, ...u } : { ...u })
  }
  return Array.from(byId.values())
}

async function main() {
  const local = readJsonSync(USERS_PATH, [])
  const fromSheet = await readJsonFromSheetTab('users.json')
  const merged = mergeUsers(fromSheet || [], local)
  console.log(
    `[merge-users] sheet rows: ${fromSheet?.length ?? 'n/a'} | local: ${local.length} | merged: ${merged.length}`,
  )
  writeJsonSync(USERS_PATH, merged)
  await flushSheetMirrorQueue()
  console.log('[merge-users] Done. users.json saved and Google Sheet tab db_users updated.')
}

main().catch((e) => {
  console.error('[merge-users] Failed:', e)
  process.exit(1)
})
