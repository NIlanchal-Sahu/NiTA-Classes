import { Router } from 'express'
import {
  loginWithPassword,
  requestOtp,
  verifyOtp,
  verifyToken,
  getUserById,
  getUsers,
  saveUsers,
  changePassword,
} from '../auth.js'
import { getStudentAvatarPublicUrl } from '../studentProfileUtils.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync } from 'fs'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const WALLET_ATTENDANCE_PATH = join(__dirname, '..', 'data', 'attendance.json')

function loadWalletAttendance() {
  if (!existsSync(WALLET_ATTENDANCE_PATH)) return []
  try {
    return JSON.parse(readFileSync(WALLET_ATTENDANCE_PATH, 'utf8') || '[]')
  } catch {
    return []
  }
}

function getWalletClassesTotal(userId) {
  return loadWalletAttendance()
    .filter((x) => x.studentId === userId)
    .reduce((sum, x) => sum + (Number(x.classesCount) || 0), 0)
}

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })
  req.auth = payload
  next()
}

router.post('/login', (req, res) => {
  const { email, password, role } = req.body || {}
  if (!email?.trim() || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required' })
  }
  if (!['student', 'admin', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student, teacher, or admin' })
  }
  const result = loginWithPassword(email, password, role)
  if (!result.ok) return res.status(401).json({ error: result.error })
  res.json({ token: result.token, user: result.user })
})

router.post('/otp/request', (req, res) => {
  const { email, role } = req.body || {}
  if (!email?.trim() || !role) {
    return res.status(400).json({ error: 'Email and role are required' })
  }
  if (!['student', 'admin', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student, teacher, or admin' })
  }
  const result = requestOtp(email, role)
  if (!result.ok) return res.status(400).json({ error: result.error })
  const payload = { message: 'OTP sent. Check your email or (in dev) use otpForDev.' }
  if (result.otpForDev != null) payload.otpForDev = result.otpForDev
  res.json(payload)
})

router.post('/otp/verify', (req, res) => {
  const { email, otp } = req.body || {}
  if (!email?.trim() || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' })
  }
  const result = verifyOtp(email, otp)
  if (!result.ok) return res.status(401).json({ error: result.error })
  res.json({ token: result.token, user: result.user })
})

router.post('/password/change', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' })
  }
  const result = changePassword(req.auth.userId, currentPassword, newPassword)
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json({ success: true })
})

router.get('/me', authMiddleware, (req, res) => {
  const user = getUserById(req.auth.userId)
  if (!user) return res.status(401).json({ error: 'User not found' })
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || String(user.email || '').split('@')[0],
  }
  if (user.studentId) payload.studentId = user.studentId
  if (user.role === 'student') {
    const syncedTotal = getWalletClassesTotal(user.id)
    if ((Number(user.totalClassesAttended) || 0) !== syncedTotal) {
      const users = getUsers()
      const idx = users.findIndex((u) => u.id === user.id)
      if (idx >= 0) {
        users[idx] = { ...users[idx], totalClassesAttended: syncedTotal }
        saveUsers(users)
      }
    }
    payload.walletBalance = Number(user.walletBalance) ?? 0
    payload.totalClassesAttended = syncedTotal
    payload.vvipValidUntil = user.vvipValidUntil || null
    const avatarUrl = getStudentAvatarPublicUrl(user.id)
    if (avatarUrl) payload.avatarUrl = avatarUrl
  }
  res.json({ user: payload })
})

export default router
