import { Router } from 'express'
import { loginWithPassword, requestOtp, verifyOtp, verifyToken, getUserById } from '../auth.js'

const router = Router()

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

router.get('/me', authMiddleware, (req, res) => {
  const user = getUserById(req.auth.userId)
  if (!user) return res.status(401).json({ error: 'User not found' })
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || user.email.split('@')[0],
  }
  if (user.role === 'student') {
    payload.walletBalance = Number(user.walletBalance) ?? 0
    payload.totalClassesAttended = Number(user.totalClassesAttended) ?? 0
    payload.vvipValidUntil = user.vvipValidUntil || null
  }
  res.json({ user: payload })
})

export default router
