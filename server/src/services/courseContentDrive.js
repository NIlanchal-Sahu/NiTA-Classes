import { Readable } from 'stream'
import { getDriveV3, getGoogleDriveParentFolderId } from './googleProfileSync.js'

const ROOT_FOLDER_NAME = 'NITA_Course_Content'

function safeSeg(s) {
  return String(s || '')
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 120) || 'x'
}

async function ensureChildFolder(drive, parentId, folderName) {
  const esc = folderName.replace(/'/g, "\\'")
  const q = `mimeType='application/vnd.google-apps.folder' and name='${esc}' and '${parentId}' in parents and trashed=false`
  const existing = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 1 })
  if (existing.data.files?.length) return existing.data.files[0].id
  const create = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })
  return create.data.id
}

/**
 * NITA_Course_Content / Course_{id} / Module_{id} / Chapter_{id}
 */
export async function ensureCourseChapterFolder(courseId, moduleId, chapterId) {
  const drive = await getDriveV3()
  const rootParent = getGoogleDriveParentFolderId()
  if (!drive || !rootParent) return null
  let pid = await ensureChildFolder(drive, rootParent, ROOT_FOLDER_NAME)
  pid = await ensureChildFolder(drive, pid, `Course_${safeSeg(courseId)}`)
  pid = await ensureChildFolder(drive, pid, `Module_${safeSeg(moduleId)}`)
  pid = await ensureChildFolder(drive, pid, `Chapter_${safeSeg(chapterId)}`)
  return pid
}

function mimeFromName(name) {
  const n = String(name || '').toLowerCase()
  if (n.endsWith('.pdf')) return 'application/pdf'
  if (n.endsWith('.doc')) return 'application/msword'
  if (n.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  return 'application/octet-stream'
}

/**
 * Upload chapter notes; set link sharing so students can embed /preview without Google login.
 */
export async function uploadChapterNotesBuffer(buffer, { fileName, mimeType, courseId, moduleId, chapterId }) {
  const drive = await getDriveV3()
  const folderId = await ensureCourseChapterFolder(courseId, moduleId, chapterId)
  if (!drive || !folderId || !buffer || !Buffer.isBuffer(buffer)) {
    return { ok: false, error: 'Drive not configured or invalid file' }
  }
  const name = String(fileName || 'notes.pdf').replace(/[^\w.\- ()[\]]+/g, '_').slice(0, 180) || 'notes.pdf'
  const mime = mimeType || mimeFromName(name)

  const res = await drive.files.create({
    requestBody: { name, parents: [folderId] },
    media: { mimeType: mime, body: Readable.from(buffer) },
    fields: 'id, webViewLink',
  })
  const fileId = res.data.id
  if (fileId) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
        sendNotificationEmail: false,
      })
    } catch (e) {
      console.warn('[courseContentDrive] anyone permission failed:', e.message)
    }
  }
  const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : ''
  return {
    ok: true,
    fileId: fileId || '',
    previewUrl,
    webViewLink: res.data.webViewLink || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : ''),
    mimeType: mime,
    fileName: name,
  }
}
