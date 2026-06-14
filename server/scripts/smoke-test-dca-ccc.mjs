/**
 * Smoke test: DCA CCC content, LMS unlock flow, PDF files + URLs.
 * Run: node server/scripts/smoke-test-dca-ccc.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const DOCS = join(ROOT, 'docs', 'ncvrt')
const CONTENT = join(__dirname, '..', 'src', 'data', 'academy_course_content.json')
const PDF_DIR = join(ROOT, 'public', 'dca-ccc')
const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5173'

let errors = 0
function ok(msg) {
  console.log('OK', msg)
}
function fail(msg) {
  console.error('FAIL', msg)
  errors++
}

function getFlatChapterOrder(courseNode) {
  const modules = (courseNode?.modules || [])
    .slice()
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  const ids = []
  for (const m of modules) {
    const chapters = (m.chapters || [])
      .slice()
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    for (const c of chapters) ids.push(String(c.id))
  }
  return ids
}

function simulateUnlock(flatOrder, completedIds) {
  const completedSet = new Set(completedIds.map(String))
  const unlockedSet = new Set()
  if (flatOrder.length > 0) unlockedSet.add(flatOrder[0])
  for (let i = 0; i < flatOrder.length; i += 1) {
    if (completedSet.has(flatOrder[i]) && flatOrder[i + 1]) unlockedSet.add(flatOrder[i + 1])
  }
  return unlockedSet
}

const requiredNotes = [
  'notes/01-introduction-to-computer.md',
  'notes/02-operating-system.md',
  'notes/03-word-processing.md',
  'notes/04-spreadsheet.md',
  'notes/05-presentation.md',
  'notes/06-internet-web-browsing.md',
  'notes/07-communication-collaboration.md',
  'notes/08-digital-financial-services.md',
  'notes/09-e-governance-services.md',
  'notes/10-cyber-security.md',
  'notes/11-future-skills.md',
]

for (const f of requiredNotes) {
  const p = join(DOCS, f)
  if (existsSync(p)) ok(f)
  else fail(`Missing ${f}`)
}

const tree = JSON.parse(readFileSync(CONTENT, 'utf8'))
const dca = tree.find((c) => String(c.courseId).toLowerCase() === 'dca')
if (!dca) fail('No dca entry in academy_course_content.json')
else {
  ok(`DCA LMS: ${dca.modules.length} modules`)
  const flat = getFlatChapterOrder(dca)
  ok(`DCA LMS: ${flat.length} chapters`)
  if (dca.modules.length < 12) fail('Expected 12 modules')
  if (flat.length < 40) fail('Expected at least 40 chapters')

  const lastMod = dca.modules[dca.modules.length - 1]
  const lastCh = lastMod.chapters[lastMod.chapters.length - 1]
  if (!String(lastCh.title).toLowerCase().includes('answer')) fail('Exam prep should end with answer key chapter')
  else ok('Exam prep ends with answer key chapter')

  // Sequential unlock (mirrors server/src/routes/student.js)
  const initial = simulateUnlock(flat, [])
  if (initial.size !== 1 || !initial.has(flat[0])) fail('Only first chapter should unlock initially')
  else ok('Unlock: first chapter only at start')

  const afterNotes = simulateUnlock(flat, [flat[0]])
  if (!afterNotes.has(flat[1]) || afterNotes.has(flat[2])) fail('After notes: practice unlocks, answer key locked')
  else ok('Unlock: practice after notes, key stays locked')

  for (let i = 0; i < flat.length - 1; i += 1) {
    const u = simulateUnlock(flat, flat.slice(0, i + 1))
    if (!u.has(flat[i + 1])) {
      fail(`Unlock: ${flat[i + 1]} should unlock after ${flat[i]}`)
      break
    }
  }
  if (errors === 0) ok('Unlock: full sequential chain verified')

  const mod3Idx = flat.indexOf('ch-ccc-03-notes')
  if (mod3Idx >= 0) {
    const mod3 = flat.slice(mod3Idx, mod3Idx + 4)
    const afterLab = simulateUnlock(flat, mod3.slice(0, 3))
    if (mod3[3] && !afterLab.has(mod3[3])) fail('Word answer key should unlock after practical lab')
    else if (mod3[3]) ok('Unlock: Word answer key after notes + practice + lab')
  }
}

const pdfs = [
  'DCA-CCC-Study-Notes.pdf',
  'DCA-CCC-Complete-Student.pdf',
  'DCA-CCC-Complete-Teacher.pdf',
  'DCA-CCC-MCQ-Bank-Teacher.pdf',
]

for (const pdf of pdfs) {
  const p = join(PDF_DIR, pdf)
  if (existsSync(p)) ok(`PDF on disk: ${pdf}`)
  else fail(`Missing PDF ${pdf}`)
}

async function checkPdfUrls() {
  let reachable = 0
  for (const pdf of pdfs) {
    const url = `${BASE_URL}/dca-ccc/${pdf}`
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) {
        ok(`PDF URL ${url} (${res.status})`)
        reachable++
      } else {
        console.warn(`WARN PDF URL ${res.status}: ${url}`)
      }
    } catch {
      console.warn(`WARN Could not fetch ${url} (start npm run dev to verify HTTP)`)
    }
  }
  if (reachable === 0) console.log('  (PDF files OK on disk; HTTP check skipped — dev server not reachable)')
}

await checkPdfUrls()

if (errors) {
  console.error(`\n${errors} smoke test failure(s)`)
  process.exit(1)
}
console.log('\nAll smoke checks passed.')
