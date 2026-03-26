import { Router } from 'express'
import multer from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { verifyToken, getUserById, getUsers, saveUsers } from '../auth.js'
import { syncStudentProfileToGoogle, isGoogleConfigured } from '../services/googleProfileSync.js'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROFILES_PATH = join(__dirname, '..', 'data', 'student_profiles.json')
const UPLOAD_ROOT = join(__dirname, '..', 'uploads', 'student-profiles')
const ACADEMY_STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'student_enrollments.json')

const MAX_FILE_SIZE = 2 * 1024 * 1024

const router = Router()

function loadJson(path, fallback = []) {
  return readJsonSync(path, fallback)
}

function saveJson(path, data) {
  writeJsonSync(path, data)
}

function studentAuth(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })
  if (payload.role !== 'student') return res.status(403).json({ error: 'Student access only' })
  req.auth = payload
  next()
}

function digits(input) {
  return String(input || '').replace(/\D/g, '')
}

function resolveAcademyStudent(authUser) {
  const students = loadJson(ACADEMY_STUDENTS_PATH, [])
  const emailDigits = digits(authUser?.email).slice(-10)
  return (
    students.find((s) => s.accountUserId === authUser?.id) ||
    students.find((s) => digits(s.phone).slice(-10) === emailDigits) ||
    null
  )
}

function enrollmentSummaryText(academyStudentId) {
  if (!academyStudentId) return ''
  const enrollments = loadJson(ENROLLMENTS_PATH, [])
  const rows = enrollments.filter((e) => e.studentId === academyStudentId)
  if (!rows.length) return ''
  return rows
    .map((e) => `${e.courseId || ''} (${String(e.createdAt || '').slice(0, 10)})`)
    .join('; ')
}

function defaultProfile(authUserId, email) {
  return {
    authUserId,
    fullName: '',
    dateOfBirth: '',
    gender: '',
    mobile: '',
    email: email || '',
    aadhaarNumber: '',
    aadhaarFileUrl: '',
    aadhaarLocalPath: '',
    /** Portal header / UI only */
    avatarUrl: '',
    avatarLocalPath: '',
    /** Passport-size photo for certificates (separate from portal avatar) */
    passportPhotoUrl: '',
    passportPhotoLocalPath: '',
    /** @deprecated migrated to passport */
    profilePhotoUrl: '',
    profilePhotoLocalPath: '',
    fullAddress: '',
    streetVillage: '',
    districtState: '',
    pinCode: '',
    highestQualification: '',
    yearOfPassing: '',
    fatherName: '',
    motherName: '',
    emergencyContact: '',
    parentsContact: '',
    coursesSummary: '',
    enrollmentSummary: '',
    driveFolderId: null,
    updatedAt: null,
    googleSyncNote: '',
  }
}

function getProfile(userId) {
  const list = loadJson(PROFILES_PATH, [])
  const idx = list.findIndex((p) => p.authUserId === userId)
  return { list, idx, record: idx >= 0 ? list[idx] : null }
}

function validateBody(body) {
  const errors = []
  const required = [
    'fullName',
    'dateOfBirth',
    'gender',
    'mobile',
    'email',
    'aadhaarNumber',
    'fullAddress',
    'streetVillage',
    'districtState',
    'pinCode',
    'highestQualification',
    'yearOfPassing',
  ]
  for (const k of required) {
    if (!String(body[k] ?? '').trim()) errors.push(`${k} is required`)
  }
  const aadhaar = String(body.aadhaarNumber || '').replace(/\D/g, '')
  if (aadhaar.length !== 12) errors.push('Aadhaar must be exactly 12 digits')
  const mobile = String(body.mobile || '').replace(/\D/g, '')
  if (mobile.length !== 10) errors.push('Mobile must be 10 digits')
  const pin = String(body.pinCode || '').replace(/\D/g, '')
  if (pin.length !== 6) errors.push('PIN code must be 6 digits')
  return { errors, aadhaar, mobile, pin }
}

mkdirSync(UPLOAD_ROOT, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(UPLOAD_ROOT, req.auth.userId)
    mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname || '') || '.bin'
    const base = file.fieldname === 'profilePhoto' ? 'profile' : 'aadhaar'
    cb(null, `${base}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'aadhaarFile') {
      const ok =
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        /\.(jpg|jpeg|png|webp|pdf)$/i.test(file.originalname || '')
      if (ok) cb(null, true)
      else cb(new Error('Aadhaar: only JPG, PNG, WebP or PDF'))
      return
    }
    const ok =
      file.mimetype.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.originalname || '')
    if (ok) cb(null, true)
    else cb(new Error('Profile & passport photos: JPG, PNG or WebP only'))
  },
})

function publicUrlForLocal(localPath) {
  if (!localPath || !existsSync(localPath)) return ''
  const rel = localPath.replace(/\\/g, '/').split('/uploads/')[1]
  return rel ? `/uploads/${rel}` : ''
}

function profileResponse(record) {
  return {
    ...record,
    profilePhotoPublicUrl: publicUrlForLocal(record.profilePhotoLocalPath),
    aadhaarPublicUrl: publicUrlForLocal(record.aadhaarLocalPath),
    isGoogleSyncConfigured: isGoogleConfigured(),
  }
}

router.get('/portal/student-profile', studentAuth, (req, res) => {
  const user = getUserById(req.auth.userId)
  const { idx, record } = getProfile(req.auth.userId)
  const academy = resolveAcademyStudent(user)
  const base = record ? { ...record } : defaultProfile(req.auth.userId, user?.email || '')
  if (!base.fullName && user?.name) base.fullName = user.name
  if (!base.mobile && user?.email) {
    const d = digits(user.email).slice(-10)
    if (d.length === 10) base.mobile = d
  }
  base.coursesSummary = academy?.courseEnrolled || base.coursesSummary || ''
  base.enrollmentSummary = enrollmentSummaryText(academy?.id) || base.enrollmentSummary || ''
  res.json({ profile: profileResponse(base) })
})

router.put('/portal/student-profile', studentAuth, (req, res) => {
  const body = req.body || {}
  const { errors, aadhaar, mobile, pin } = validateBody(body)
  if (errors.length) return res.status(400).json({ error: errors.join('. ') })

  const user = getUserById(req.auth.userId)
  const academy = resolveAcademyStudent(user)
  const { list, idx } = getProfile(req.auth.userId)
  const prev = idx >= 0 ? list[idx] : defaultProfile(req.auth.userId, user?.email || '')

  const next = {
    ...prev,
    fullName: String(body.fullName).trim(),
    dateOfBirth: String(body.dateOfBirth).slice(0, 10),
    gender: String(body.gender).trim(),
    mobile,
    email: String(body.email).trim().toLowerCase(),
    aadhaarNumber: aadhaar,
    fullAddress: String(body.fullAddress).trim(),
    streetVillage: String(body.streetVillage).trim(),
    districtState: String(body.districtState).trim(),
    pinCode: pin,
    highestQualification: String(body.highestQualification).trim(),
    yearOfPassing: String(body.yearOfPassing).trim(),
    fatherName: String(body.fatherName || '').trim(),
    motherName: String(body.motherName || '').trim(),
    emergencyContact: String(body.emergencyContact || '').replace(/\D/g, '').slice(0, 10),
    parentsContact: String(body.parentsContact || '').replace(/\D/g, '').slice(0, 10),
    coursesSummary: academy?.courseEnrolled || String(body.coursesSummary || '').trim(),
    enrollmentSummary: enrollmentSummaryText(academy?.id),
    authUserId: req.auth.userId,
    updatedAt: new Date().toISOString(),
  }

  if (idx >= 0) list[idx] = next
  else list.push(next)
  saveJson(PROFILES_PATH, list)

  const users = getUsers()
  const uix = users.findIndex((u) => u.id === req.auth.userId)
  if (uix >= 0) {
    users[uix].name = next.fullName
    saveUsers(users)
  }

  const localPaths = {
    avatar: next.avatarLocalPath,
    passportPhoto: next.passportPhotoLocalPath,
    aadhaarFile: next.aadhaarLocalPath,
  }

  syncStudentProfileToGoogle(
    {
      ...next,
      avatarUrl: next.avatarUrl,
      passportPhotoUrl: next.passportPhotoUrl,
      aadhaarFileUrl: next.aadhaarFileUrl,
    },
    localPaths
  ).then((result) => {
    const { list: L, idx: i } = getProfile(req.auth.userId)
    if (i < 0) return
    if (result.folderId) L[i].driveFolderId = result.folderId
    if (result.avatarUrl) L[i].avatarUrl = result.avatarUrl
    if (result.passportPhotoUrl) L[i].passportPhotoUrl = result.passportPhotoUrl
    if (result.aadhaarFileUrl) L[i].aadhaarFileUrl = result.aadhaarFileUrl
    if (result.sheet) L[i].googleSyncNote = `Sheet synced ${new Date().toISOString().slice(0, 19)}`
    saveJson(PROFILES_PATH, L)
  })

  res.json({ success: true, profile: profileResponse(next) })
})

router.post(
  '/portal/student-profile/upload',
  studentAuth,
  (req, res, next) => {
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'passportPhoto', maxCount: 1 },
      { name: 'aadhaarFile', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || 'Upload failed' })
      next()
    })
  },
  async (req, res) => {
    try {
      const files = req.files || {}
      const av = files.avatar?.[0]
      const pp = files.passportPhoto?.[0]
      const aad = files.aadhaarFile?.[0]
      if (!av && !pp && !aad) return res.status(400).json({ error: 'No files uploaded' })

      const { list, idx } = getProfile(req.auth.userId)
      const user = getUserById(req.auth.userId)
      const prev = idx >= 0 ? list[idx] : defaultProfile(req.auth.userId, user?.email || '')

      if (av) prev.avatarLocalPath = av.path
      if (pp) prev.passportPhotoLocalPath = pp.path
      if (aad) prev.aadhaarLocalPath = aad.path
      prev.updatedAt = new Date().toISOString()

      if (idx >= 0) list[idx] = prev
      else list.push(prev)
      saveJson(PROFILES_PATH, list)

      const result = await syncStudentProfileToGoogle(prev, {
        avatar: prev.avatarLocalPath,
        passportPhoto: prev.passportPhotoLocalPath,
        aadhaarFile: prev.aadhaarLocalPath,
      })

      const { list: L, idx: i } = getProfile(req.auth.userId)
      if (i >= 0) {
        if (result.folderId) L[i].driveFolderId = result.folderId
        if (result.avatarUrl) L[i].avatarUrl = result.avatarUrl
        if (result.passportPhotoUrl) L[i].passportPhotoUrl = result.passportPhotoUrl
        if (result.aadhaarFileUrl) L[i].aadhaarFileUrl = result.aadhaarFileUrl
        if (result.sheet) L[i].googleSyncNote = `Upload + sheet ${new Date().toISOString().slice(0, 19)}`
        saveJson(PROFILES_PATH, L)
      }

      const final = getProfile(req.auth.userId).record
      res.json({
        success: true,
        profile: profileResponse(final || prev),
        message:
          'Files saved on server.' +
          (isGoogleConfigured() ? ' Google Drive/Sheets sync attempted when credentials and IDs are set.' : ''),
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: e.message || 'Upload failed' })
    }
  }
)

export default router
