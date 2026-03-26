import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { existsSync } from 'fs'
import { getStudentAvatarPublicUrl } from './studentProfileUtils.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { applyReferralCodeToStudent } from './referrals.js'
import { readJsonSync, writeJsonSync } from './services/sheetsJsonStore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_PATH = join(__dirname, 'data', 'users.json')
const ENROLLMENTS_PATH = join(__dirname, 'data', 'enrollments.json')
const SALT_ROUNDS = 10

const JWT_SECRET = process.env.JWT_SECRET || 'nita-dev-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// In-memory OTP store: { email: { otp, expiresAt, role } }
const otpStore = new Map()
const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const OTP_LENGTH = 6

function normalizeIdentifier(input) {
  const raw = String(input || '').trim()
  const digits = raw.replace(/\D/g, '')
  // allow mobile login (10 digits) for students
  if (digits.length === 10) return digits
  return raw.toLowerCase()
}

export function getUsers() {
  return readJsonSync(USERS_PATH, [])
}

export function saveUsers(users) {
  writeJsonSync(USERS_PATH, users)
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS)
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function findUserByEmail(email) {
  const normalized = normalizeIdentifier(email)
  return getUsers().find((u) => String(u.email || '').toLowerCase() === normalized) || null
}

/** Student: login with 10-digit phone, email, or Student ID (NITA…). Admin/Teacher: email only. */
export function findUserByLogin(identifier) {
  const raw = String(identifier || '').trim()
  if (!raw) return null
  if (/^nita\d+/i.test(raw)) {
    const sid = raw.toUpperCase()
    return getUsers().find((u) => u.studentId && String(u.studentId).toUpperCase() === sid) || null
  }
  return findUserByEmail(raw)
}

export function changePassword(userId, currentPassword, newPassword) {
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters' }
  }
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return { ok: false, error: 'User not found' }
  const user = users[idx]
  if (!user.passwordHash) return { ok: false, error: 'Password not set for this account' }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { ok: false, error: 'Current password is incorrect' }
  }
  users[idx] = { ...user, passwordHash: hashPassword(String(newPassword)) }
  saveUsers(users)
  return { ok: true }
}

/** Admin: reset student password by Student ID or 10-digit phone */
export function adminResetStudentPassword(studentIdOrPhone, newPassword) {
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters' }
  }
  const raw = String(studentIdOrPhone || '').trim()
  let user = null
  if (/^nita\d+/i.test(raw)) {
    const sid = raw.toUpperCase()
    user = getUsers().find((u) => u.studentId && String(u.studentId).toUpperCase() === sid)
  } else {
    const norm = normalizeIdentifier(raw)
    user = getUsers().find((u) => u.role === 'student' && String(u.email || '').toLowerCase() === norm)
  }
  if (!user) return { ok: false, error: 'Student account not found' }
  if (user.role !== 'student') return { ok: false, error: 'Not a student account' }
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  users[idx] = { ...users[idx], passwordHash: hashPassword(String(newPassword)) }
  saveUsers(users)
  return { ok: true }
}

/** Admin: reset admin password by admin email */
export function adminResetAdminPassword(adminEmail, newPassword) {
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters' }
  }
  const email = String(adminEmail || '').trim().toLowerCase()
  if (!email) return { ok: false, error: 'Admin email is required' }
  const users = getUsers()
  const idx = users.findIndex((u) => u.role === 'admin' && String(u.email || '').toLowerCase() === email)
  if (idx < 0) return { ok: false, error: 'Admin account not found' }
  users[idx] = { ...users[idx], passwordHash: hashPassword(String(newPassword)) }
  saveUsers(users)
  return { ok: true }
}

function userToPublic(user) {
  const base = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || String(user.email || '').split('@')[0],
    ...(user.studentId ? { studentId: user.studentId } : {}),
  }
  if (user.role === 'student') {
    const avatarUrl = getStudentAvatarPublicUrl(user.id)
    if (avatarUrl) base.avatarUrl = avatarUrl
  }
  return base
}

export function loginWithPassword(email, password, role) {
  const user = role === 'student' ? findUserByLogin(email) : findUserByEmail(email)
  if (!user || user.role !== role) return { ok: false, error: 'Invalid login or role' }
  if (!user.passwordHash) return { ok: false, error: 'Password login not set. Use OTP or set password.' }
  if (!verifyPassword(password, user.passwordHash)) return { ok: false, error: 'Invalid password' }
  if (user.role === 'student') {
    // Ensure referral linking also works for password-login users (not only OTP flow).
    tryApplyLatestReferralFromEnrollment(user)
  }
  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  return { ok: true, token, user: userToPublic(user) }
}

function tryApplyLatestReferralFromEnrollment(user) {
  try {
    if (!user || user.role !== 'student' || !existsSync(ENROLLMENTS_PATH)) return
    const list = readJsonSync(ENROLLMENTS_PATH, [])
    const mobile = String(user.email || '').replace(/\D/g, '')
    if (!mobile) return
    const match = list
      .slice()
      .reverse()
      .find((e) => String(e.mobile || '').replace(/\D/g, '').slice(-10) === mobile.slice(-10))
    const code = match?.referralCode
    if (code) applyReferralCodeToStudent({ studentId: user.id, referralCode: code })
  } catch {
    // ignore referral auto-link errors
  }
}

export function requestOtp(email, role) {
  const rawInput = String(email || '').trim()
  const normalized = normalizeIdentifier(rawInput)
  const users = getUsers()
  let user = role === 'student' ? findUserByLogin(rawInput) : findUserByEmail(rawInput)
  if (role === 'admin' || role === 'teacher') {
    if (!user || user.role !== role) return { ok: false, error: `No ${role} account with this email` }
  } else {
    if (!user) {
      user = { id: `student-${Date.now()}`, email: normalized, role: 'student', name: normalized.split('@')[0] }
      users.push(user)
      saveUsers(users)
    } else if (user.role !== 'student') return { ok: false, error: 'This email is not registered as student' }
  }
  const otpKey = user && role === 'student' ? normalizeIdentifier(user.email) : normalized
  const otp = generateOtp()
  otpStore.set(otpKey, { otp, expiresAt: Date.now() + OTP_TTL_MS, role })
  return { ok: true, otpForDev: process.env.NODE_ENV !== 'production' ? otp : undefined }
}

export function verifyOtp(email, otp) {
  const rawInput = String(email || '').trim()
  const normalized = normalizeIdentifier(rawInput)
  const userForKey = findUserByLogin(rawInput)
  const otpKey =
    userForKey && userForKey.role === 'student' ? normalizeIdentifier(userForKey.email) : normalized
  const stored = otpStore.get(otpKey)
  if (!stored) return { ok: false, error: 'OTP expired or not requested' }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(otpKey)
    return { ok: false, error: 'OTP expired' }
  }
  if (stored.otp !== String(otp).trim()) return { ok: false, error: 'Invalid OTP' }
  otpStore.delete(otpKey)
  const user = findUserByLogin(rawInput) || findUserByEmail(normalized)
  const userData = user
    ? userToPublic(user)
    : { id: `student-${Date.now()}`, email: normalized, role: 'student', name: normalized }
  if (!user) {
    const users = getUsers()
    users.push({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      walletBalance: 0,
      totalClassesAttended: 0,
      vvipValidUntil: null,
    })
    saveUsers(users)
  }

  // Auto-apply referral from admissions queue (mobile-based).
  tryApplyLatestReferralFromEnrollment({ id: userData.id, email: normalized, role: 'student' })

  const token = signToken({ userId: userData.id, email: userData.email, role: userData.role })
  return { ok: true, token, user: userData }
}

export function getUserById(userId) {
  return getUsers().find((u) => u.id === userId) || null
}
