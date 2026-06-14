/**
 * Upsert a local dev teacher account with a known password.
 * Run: node server/scripts/seed-dev-teacher.mjs
 *
 * Default login (Teacher role on /login):
 *   teacher-dev@nitaclasses.in  OR  teacher-dev  OR  9999999999
 *   Password: Teacher@123
 */
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from '../src/services/sheetsJsonStore.js'
import { hashPassword } from '../src/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_PATH = join(__dirname, '..', 'src', 'data', 'users.json')

const DEV_ID = 'TCH-DEV'
const DEV_PASSWORD = 'Teacher@123'

const devTeacher = {
  id: DEV_ID,
  role: 'teacher',
  name: 'Dev Teacher',
  mobile: '9999999999',
  email: 'teacher-dev@nitaclasses.in',
  username: 'teacher-dev',
  qualification: 'Dev account for local testing',
  expertise: 'DCA CCC content editing',
  assignedCourseIds: ['dca', 'cca', 'ai-associate', 'ai-video-creation', 'spoken-english-mastery'],
}

const users = readJsonSync(USERS_PATH, [])
const idx = users.findIndex((u) => u.id === DEV_ID || u.username === 'teacher-dev')
const passwordHash = hashPassword(DEV_PASSWORD)

if (idx >= 0) {
  users[idx] = { ...users[idx], ...devTeacher, passwordHash }
  console.log('[seed-dev-teacher] Updated existing dev teacher account.')
} else {
  users.push({ ...devTeacher, passwordHash })
  console.log('[seed-dev-teacher] Added new dev teacher account.')
}

writeJsonSync(USERS_PATH, users)

console.log('')
console.log('Dev teacher credentials (select Teacher on /login):')
console.log('  Login:  teacher-dev@nitaclasses.in  (or username teacher-dev / mobile 9999999999)')
console.log(`  Password: ${DEV_PASSWORD}`)
console.log('  Content studio: /admin/content')
