import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'
import { normCourseId, parseDateOnly } from './attendanceStats.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ACADEMY_ATTENDANCE_PATH = join(__dirname, '..', 'data', 'academy_attendance.json')
const BATCHES_PATH = join(__dirname, '..', 'data', 'academy_batches.json')

function loadAcademyAttendance() {
  return readJsonSync(ACADEMY_ATTENDANCE_PATH, [])
}

function saveAcademyAttendance(rows) {
  writeJsonSync(ACADEMY_ATTENDANCE_PATH, rows)
}

function getStudentBatchIds(student) {
  if (!student) return []
  const legacy = student.batchId ? [String(student.batchId)] : []
  const extra = Array.isArray(student.batchIds) ? student.batchIds.map(String) : []
  return [...new Set([...extra, ...legacy].filter(Boolean))]
}

export function resolveBatchForStudentCourse(student, batches, courseId) {
  const cid = normCourseId(courseId)
  const batchIds = getStudentBatchIds(student)
  for (const bid of batchIds) {
    const batch = (batches || []).find(
      (b) => String(b.id) === bid && normCourseId(b.courseId) === cid,
    )
    if (batch) return String(batch.id)
  }
  const byCourse = (batches || []).find((b) => normCourseId(b.courseId) === cid)
  return byCourse ? String(byCourse.id) : batchIds[0] || ''
}

/**
 * Merge academy attendance rows with wallet pay-for-class rows (auth user id).
 * Wallet payment = present unless admin already marked absent for that day.
 */
export function mergeStudentAttendanceRecords({
  student,
  authUserId,
  academyRows = [],
  walletRows = [],
}) {
  const studentId = student?.id
  const walletAuthId = authUserId || student?.accountUserId
  if (!studentId) return []

  const byKey = new Map()

  for (const r of academyRows) {
    if (String(r.studentId) !== String(studentId)) continue
    const date = parseDateOnly(r.date)
    const cid = normCourseId(r.courseId)
    if (!date || !cid) continue
    byKey.set(`${cid}|${date}`, {
      studentId,
      courseId: r.courseId || cid,
      date,
      status: String(r.status || '').toLowerCase() === 'absent' ? 'absent' : 'present',
      source: 'academy',
      batchId: r.batchId || '',
      markedBy: r.markedBy || '',
    })
  }

  for (const w of walletRows) {
    if (!walletAuthId || String(w.studentId) !== String(walletAuthId)) continue
    const paid = Number(w.classesCount) || 0
    if (paid <= 0) continue
    const date = parseDateOnly(w.date)
    const cid = normCourseId(w.courseId)
    if (!date || !cid) continue
    const key = `${cid}|${date}`
    const existing = byKey.get(key)
    if (existing?.status === 'absent') continue
    byKey.set(key, {
      studentId,
      courseId: w.courseId,
      date,
      status: 'present',
      source: 'wallet',
      classesCount: paid,
      batchId: existing?.batchId || '',
      markedBy: existing?.markedBy || 'wallet:auto',
    })
  }

  return [...byKey.values()]
}

/** Write or update academy_attendance when student pays via wallet / VVIP scan. */
export function upsertAcademyPresentFromWallet({
  student,
  courseId,
  date,
  markedBy = 'wallet:auto',
  batches = null,
}) {
  if (!student?.id || !courseId || !date) return { ok: false, reason: 'missing_fields' }

  const d = parseDateOnly(date)
  const cid = normCourseId(courseId)
  const batchList = batches || readJsonSync(BATCHES_PATH, [])
  const batchId = resolveBatchForStudentCourse(student, batchList, cid)
  const records = loadAcademyAttendance()

  const idx = records.findIndex(
    (r) =>
      parseDateOnly(r.date) === d &&
      String(r.studentId) === String(student.id) &&
      normCourseId(r.courseId) === cid,
  )

  if (idx >= 0) {
    if (String(records[idx].status) === 'absent') {
      return { ok: false, reason: 'admin_marked_absent' }
    }
    records[idx] = {
      ...records[idx],
      status: 'present',
      batchId: records[idx].batchId || batchId,
      markedBy: records[idx].markedBy || markedBy,
      syncedFromWallet: true,
      updatedAt: new Date().toISOString(),
    }
  } else {
    records.push({
      id: `att-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      date: d,
      batchId,
      courseId: cid,
      studentId: String(student.id),
      status: 'present',
      markedBy,
      syncedFromWallet: true,
      createdAt: new Date().toISOString(),
    })
  }

  saveAcademyAttendance(records)
  return { ok: true }
}

/** Backfill academy present rows from existing wallet attendance (one-time / reconcile). */
export function syncWalletHistoryToAcademy({ students, walletRows, batches = null }) {
  const batchList = batches || readJsonSync(BATCHES_PATH, [])
  let synced = 0
  let skipped = 0
  for (const student of students || []) {
    const authId = student.accountUserId
    if (!authId) {
      skipped += 1
      continue
    }
    for (const w of walletRows || []) {
      if (String(w.studentId) !== String(authId)) continue
      if (!(Number(w.classesCount) || 0) > 0) continue
      const out = upsertAcademyPresentFromWallet({
        student,
        courseId: w.courseId,
        date: w.date,
        markedBy: 'wallet:backfill',
        batches: batchList,
      })
      if (out.ok) synced += 1
      else skipped += 1
    }
  }
  return { synced, skipped }
}

export function authUserIdForStudent(student, users = []) {
  if (student?.accountUserId) return student.accountUserId
  const phone = String(student?.phone || '').replace(/\D/g, '').slice(-10)
  const match = (users || []).find(
    (u) =>
      u.role === 'student' &&
      (String(u.id) === String(student?.accountUserId) ||
        String(u.email || '').replace(/\D/g, '').slice(-10) === phone),
  )
  return match?.id || null
}
