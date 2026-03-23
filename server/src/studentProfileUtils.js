import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDENT_PROFILES_PATH = join(__dirname, 'data', 'student_profiles.json')

function loadProfiles() {
  if (!existsSync(STUDENT_PROFILES_PATH)) return []
  try {
    return JSON.parse(readFileSync(STUDENT_PROFILES_PATH, 'utf8') || '[]')
  } catch {
    return []
  }
}

/** Public URL for portal profile picture (avatar), cache-busted by updatedAt */
export function getStudentAvatarPublicUrl(userId) {
  const list = loadProfiles()
  const p = list.find((x) => x.authUserId === userId)
  if (!p?.avatarLocalPath || !existsSync(p.avatarLocalPath)) return null
  const rel = p.avatarLocalPath.replace(/\\/g, '/').split('/uploads/')[1]
  if (!rel) return null
  const v = encodeURIComponent(p.updatedAt || p.authUserId || '')
  return `/uploads/${rel}?v=${v}`
}
