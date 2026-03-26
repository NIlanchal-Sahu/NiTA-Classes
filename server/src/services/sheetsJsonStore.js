import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
const ENABLED = String(process.env.GOOGLE_SHEETS_DB_ENABLED || 'true').toLowerCase() !== 'false'
const RANGE_LABEL_KEY = 'key'
const RANGE_LABEL_VALUE = 'json'
let _sheets = null
let _authClient = null
let _bootstrapped = false
let _writeQueue = Promise.resolve()
const _ensuredTabs = new Set()

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const pathEnv = process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  try {
    if (raw) {
      return raw.trim().startsWith('{') ? JSON.parse(raw) : JSON.parse(readFileSync(raw, 'utf8'))
    }
    if (pathEnv && existsSync(pathEnv)) {
      return JSON.parse(readFileSync(pathEnv, 'utf8'))
    }
  } catch {
    return null
  }
  return null
}

async function getSheetsClient() {
  if (_authClient && _sheets) return _sheets
  const creds = loadCredentials()
  if (!creds || !SHEET_ID || !ENABLED) return null
  const { google } = await import('googleapis')
  _authClient = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  await _authClient.authorize()
  _sheets = google.sheets({ version: 'v4', auth: _authClient })
  return _sheets
}

function tabNameForPath(filePath) {
  const name = basename(String(filePath || ''), '.json').replace(/[^A-Za-z0-9_]/g, '_')
  return `db_${name}`.slice(0, 90)
}

async function ensureSheetTab(sheets, tabName) {
  if (_ensuredTabs.has(tabName)) return
  try {
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      fields: 'sheets.properties.title',
    })
    const titles = new Set((meta.data.sheets || []).map((s) => s?.properties?.title).filter(Boolean))
    if (!titles.has(tabName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
      })
    }
    _ensuredTabs.add(tabName)
  } catch (e) {
    console.warn('[sheetsJsonStore] ensureSheetTab failed:', tabName, e.message)
  }
}

function parseJsonSafe(raw, fallback = []) {
  try {
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return fallback
  }
}

export function readJsonSync(path, fallback = []) {
  if (!existsSync(path)) return fallback
  const raw = readFileSync(path, 'utf8') || JSON.stringify(fallback)
  return parseJsonSafe(raw, fallback)
}

export function writeJsonSync(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
  enqueueSheetMirror(path, data)
}

function enqueueSheetMirror(path, data) {
  _writeQueue = _writeQueue
    .then(async () => {
      const sheets = await getSheetsClient()
      if (!sheets) return
      const tab = tabNameForPath(path)
      await ensureSheetTab(sheets, tab)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${tab}!A1:B2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [RANGE_LABEL_KEY, RANGE_LABEL_VALUE],
            ['data', JSON.stringify(data)],
          ],
        },
      })
    })
    .catch((e) => console.warn('[sheetsJsonStore] mirror write failed:', e.message))
}

export async function bootstrapDataFromSheets() {
  if (_bootstrapped) return
  _bootstrapped = true
  const sheets = await getSheetsClient()
  if (!sheets) {
    console.log('[sheetsJsonStore] Google Sheets DB disabled or not configured; using local JSON files')
    return
  }
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
  for (const fileName of files) {
    const filePath = join(DATA_DIR, fileName)
    const tab = tabNameForPath(filePath)
    try {
      await ensureSheetTab(sheets, tab)
      const read = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${tab}!B2`,
      })
      const jsonString = read?.data?.values?.[0]?.[0]
      if (jsonString && String(jsonString).trim()) {
        const parsed = parseJsonSafe(String(jsonString), null)
        if (parsed != null) writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8')
      } else if (existsSync(filePath)) {
        // Seed empty/new tabs from current local file content once.
        const local = readJsonSync(filePath, [])
        enqueueSheetMirror(filePath, local)
      }
    } catch (e) {
      console.warn('[sheetsJsonStore] bootstrap sync failed:', fileName, e.message)
    }
  }
  console.log('[sheetsJsonStore] Data bootstrap completed from Google Sheets')
}
