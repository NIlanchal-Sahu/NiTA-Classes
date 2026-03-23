/**
 * Optional Google Drive + Sheets sync for student certification profiles.
 * Set env vars (see docs/STUDENT_PROFILE_GOOGLE.md). If unset, functions no-op safely.
 */
import { readFileSync, existsSync, createReadStream } from 'fs'
import { dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let _drive = null
let _sheets = null
let _authClient = null

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const pathEnv = process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  try {
    if (raw) {
      const parsed = raw.trim().startsWith('{') ? JSON.parse(raw) : JSON.parse(readFileSync(raw, 'utf8'))
      return parsed
    }
    if (pathEnv && existsSync(pathEnv)) {
      return JSON.parse(readFileSync(pathEnv, 'utf8'))
    }
    const fallback = join(__dirname, '..', 'google-service-account.json')
    if (existsSync(fallback)) {
      return JSON.parse(readFileSync(fallback, 'utf8'))
    }
  } catch (e) {
    console.warn('[googleProfileSync] Could not load service account:', e.message)
  }
  return null
}

async function getClients() {
  if (_authClient) return { drive: _drive, sheets: _sheets }
  const creds = loadCredentials()
  if (!creds) return { drive: null, sheets: null }
  const { google } = await import('googleapis')
  _authClient = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
  await _authClient.authorize()
  _drive = google.drive({ version: 'v3', auth: _authClient })
  _sheets = google.sheets({ version: 'v4', auth: _authClient })
  return { drive: _drive, sheets: _sheets }
}

const DRIVE_PARENT = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || ''
const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
const SHEET_TAB = process.env.GOOGLE_SHEETS_TAB_NAME || 'Students'
const SHARE_EMAIL = process.env.GOOGLE_DRIVE_SHARE_EMAIL || 'tech.nilanchala25@gmail.com'

export function isGoogleConfigured() {
  return !!(loadCredentials() && DRIVE_PARENT && SHEET_ID)
}

/**
 * Ensure folder NITA_Students / {Name}_{userId} exists; returns folder ID
 */
export async function ensureStudentDriveFolder(displayName, authUserId) {
  const { drive } = await getClients()
  if (!drive || !DRIVE_PARENT) return null
  const safe = String(displayName || 'Student')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .slice(0, 40) || 'Student'
  const folderName = `${safe}_${authUserId}`.replace(/\s+/g, '_')

  const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${DRIVE_PARENT}' in parents and trashed=false`
  const existing = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 1 })
  if (existing.data.files?.length) return existing.data.files[0].id

  const create = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [DRIVE_PARENT],
    },
    fields: 'id',
  })
  const folderId = create.data.id
  if (SHARE_EMAIL && folderId) {
    try {
      await drive.permissions.create({
        fileId: folderId,
        requestBody: { role: 'writer', type: 'user', emailAddress: SHARE_EMAIL },
        sendNotificationEmail: false,
      })
    } catch (e) {
      console.warn('[googleProfileSync] Folder share failed:', e.message)
    }
  }
  return folderId
}

/**
 * Upload a local file into the student's Drive folder; returns webViewLink or webContentLink
 */
export async function uploadLocalFileToDrive(localPath, driveFileName, folderId) {
  const { drive } = await getClients()
  if (!drive || !folderId || !existsSync(localPath)) return null
  const name = driveFileName || basename(localPath)
  const mime =
    name.endsWith('.pdf')
      ? 'application/pdf'
      : name.match(/\.(jpg|jpeg)$/i)
        ? 'image/jpeg'
        : name.endsWith('.png')
          ? 'image/png'
          : 'application/octet-stream'

  const res = await drive.files.create({
    requestBody: { name, parents: [folderId] },
    media: { mimeType: mime, body: createReadStream(localPath) },
    fields: 'id, webViewLink, webContentLink',
  })
  const fileId = res.data.id
  let link = res.data.webViewLink || res.data.webContentLink || null
  if (fileId && SHARE_EMAIL) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'user', emailAddress: SHARE_EMAIL },
        sendNotificationEmail: false,
      })
    } catch (_) {
      /* ignore */
    }
  }
  if (fileId && !link) {
    const meta = await drive.files.get({ fileId, fields: 'webViewLink, webContentLink' })
    link = meta.data.webViewLink || meta.data.webContentLink
  }
  return link || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : null)
}

const HEADERS = [
  'Updated At',
  'Full Name',
  'DOB',
  'Gender',
  'Mobile',
  'Email',
  'Aadhaar',
  'Full Address',
  'Street/Village',
  'District/State',
  'PIN',
  'Qualification',
  'Year',
  'Courses',
  'Enrollment',
  "Father's Name",
  "Mother's Name",
  'Emergency Contact',
  'Parents Contact',
  'Portal Avatar URL',
  'Passport Photo URL',
  'Aadhaar Doc URL',
  'Auth User ID',
]

/**
 * Append or update row by Aadhaar (column G = index 6) or Auth User ID (column V)
 */
export async function syncProfileRowToSheet(profile) {
  const { sheets } = await getClients()
  if (!sheets || !SHEET_ID) return { ok: false, reason: 'no_sheet' }

  const row = [
    new Date().toISOString(),
    profile.fullName || '',
    profile.dateOfBirth || '',
    profile.gender || '',
    profile.mobile || '',
    profile.email || '',
    profile.aadhaarNumber || '',
    profile.fullAddress || '',
    profile.streetVillage || '',
    profile.districtState || '',
    profile.pinCode || '',
    profile.highestQualification || '',
    profile.yearOfPassing || '',
    profile.coursesSummary || '',
    profile.enrollmentSummary || '',
    profile.fatherName || '',
    profile.motherName || '',
    profile.emergencyContact || '',
    profile.parentsContact || '',
    profile.avatarUrl || '',
    profile.passportPhotoUrl || profile.profilePhotoUrl || '',
    profile.aadhaarFileUrl || '',
    profile.authUserId || '',
  ]

  const range = `${SHEET_TAB}!A:W`
  const read = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  })
  const values = read.data.values || []
  if (values.length === 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [HEADERS, row] },
    })
    return { ok: true, action: 'created_header_and_row' }
  }

  let headerRow = values[0] || []
  const needsHeader = !headerRow.length || String(headerRow[0]).toLowerCase() !== 'updated at'
  if (needsHeader && values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A1:W1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [HEADERS] },
    })
  }

  const aadhaar = String(profile.aadhaarNumber || '').replace(/\D/g, '')
  const uid = String(profile.authUserId || '')
  let rowIndex = -1
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    const rowAadhaar = String(r[6] || '').replace(/\D/g, '')
    const rowUid = String(r[22] || r[21] || r[20] || '')
    if (aadhaar && rowAadhaar === aadhaar) {
      rowIndex = i + 1
      break
    }
    if (uid && (String(r[22]) === uid || String(r[21]) === uid || String(r[20]) === uid)) {
      rowIndex = i + 1
      break
    }
  }

  if (rowIndex > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A${rowIndex}:W${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
    return { ok: true, action: 'updated', row: rowIndex }
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:W`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })
  return { ok: true, action: 'appended' }
}

/**
 * After profile save: ensure Drive folder + sync sheet
 */
export async function syncStudentProfileToGoogle(profile, localPaths = {}) {
  const creds = loadCredentials()
  if (!creds) {
    return {
      drive: false,
      sheet: false,
      avatarUrl: profile.avatarUrl,
      passportPhotoUrl: profile.passportPhotoUrl,
      aadhaarFileUrl: profile.aadhaarFileUrl,
      folderId: profile.driveFolderId || null,
    }
  }
  try {
    let folderId = profile.driveFolderId || null
    if (DRIVE_PARENT && !folderId) {
      folderId = await ensureStudentDriveFolder(profile.fullName || 'Student', profile.authUserId)
    }
    let avatarUrl = profile.avatarUrl
    let passportUrl = profile.passportPhotoUrl || profile.profilePhotoUrl
    let aadhaarUrl = profile.aadhaarFileUrl

    if (folderId && localPaths.avatar && existsSync(localPaths.avatar)) {
      const link = await uploadLocalFileToDrive(localPaths.avatar, `portal_${basename(localPaths.avatar)}`, folderId)
      if (link) avatarUrl = link
    }
    if (folderId && localPaths.passportPhoto && existsSync(localPaths.passportPhoto)) {
      const link = await uploadLocalFileToDrive(
        localPaths.passportPhoto,
        `passport_${basename(localPaths.passportPhoto)}`,
        folderId
      )
      if (link) passportUrl = link
    }
    if (folderId && localPaths.aadhaarFile && existsSync(localPaths.aadhaarFile)) {
      const link = await uploadLocalFileToDrive(localPaths.aadhaarFile, basename(localPaths.aadhaarFile), folderId)
      if (link) aadhaarUrl = link
    }

    const merged = {
      ...profile,
      driveFolderId: folderId || profile.driveFolderId,
      avatarUrl,
      passportPhotoUrl: passportUrl,
      aadhaarFileUrl: aadhaarUrl,
    }
    let sheet = { ok: false }
    if (SHEET_ID) {
      sheet = await syncProfileRowToSheet(merged)
    }
    return {
      drive: !!folderId,
      sheet: !!sheet?.ok,
      folderId: merged.driveFolderId,
      avatarUrl: merged.avatarUrl,
      passportPhotoUrl: merged.passportPhotoUrl,
      aadhaarFileUrl: merged.aadhaarFileUrl,
      sheetResult: sheet,
    }
  } catch (e) {
    console.warn('[googleProfileSync] sync error:', e.message)
    return {
      drive: false,
      sheet: false,
      error: e.message,
      avatarUrl: profile.avatarUrl,
      passportPhotoUrl: profile.passportPhotoUrl,
      aadhaarFileUrl: profile.aadhaarFileUrl,
      folderId: profile.driveFolderId || null,
    }
  }
}
