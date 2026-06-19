import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync } from './sheetsJsonStore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const CONTENT_PATH = join(DATA_DIR, 'academy_course_content.json')

function dcaStats(tree) {
  if (!Array.isArray(tree)) return { modules: 0, chapters: 0 }
  const dca = tree.find((x) => String(x?.courseId || '').toLowerCase() === 'dca')
  const modules = dca?.modules?.length || 0
  const chapters = (dca?.modules || []).reduce((n, m) => n + (m.chapters?.length || 0), 0)
  return { modules, chapters }
}

/**
 * If DCA modules are missing (Sheets bootstrap or stale Render disk wiped content),
 * restore academy_course_content.json from the GitHub repo copy.
 */
export async function ensureCourseContentOnStartup() {
  if (String(process.env.COURSE_CONTENT_AUTO_RESTORE || 'true').toLowerCase() === 'false') {
    return dcaStats(readJsonSync(CONTENT_PATH, []))
  }

  let tree = readJsonSync(CONTENT_PATH, [])
  let stats = dcaStats(tree)
  if (stats.modules > 0) return stats

  const repo = process.env.COURSE_CONTENT_GIT_REPO || 'NIlanchal-Sahu/NiTA-Classes'
  const branch = process.env.COURSE_CONTENT_GIT_BRANCH || 'main'
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/server/src/data/academy_course_content.json`

  console.warn('[courseContent] DCA content empty locally — restoring from GitHub…')
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const remote = await res.json()
    const remoteStats = dcaStats(remote)
    if (remoteStats.modules === 0) {
      throw new Error('Remote academy_course_content.json has no DCA modules')
    }
    writeFileSync(CONTENT_PATH, JSON.stringify(remote, null, 2), 'utf8')
    console.log(
      `[courseContent] Restored from GitHub: ${remoteStats.modules} DCA modules, ${remoteStats.chapters} chapters`,
    )
    return remoteStats
  } catch (e) {
    console.warn('[courseContent] GitHub restore failed:', e.message)
    return stats
  }
}

export function getCourseContentStats() {
  if (!existsSync(CONTENT_PATH)) return { ok: false, dcaModules: 0, dcaChapters: 0, courses: 0 }
  const raw = readFileSync(CONTENT_PATH, 'utf8')
  const tree = readJsonSync(CONTENT_PATH, [])
  const stats = dcaStats(tree)
  return {
    ok: stats.modules > 0,
    dcaModules: stats.modules,
    dcaChapters: stats.chapters,
    courses: Array.isArray(tree) ? tree.length : 0,
    bytes: raw.length,
  }
}
