/**
 * Generate each DCA CCC PDF individually (memory-friendly on Windows).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mdToPdf } from 'md-to-pdf'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const DOCS = join(ROOT, 'docs', 'ncvrt')
const OUT = join(ROOT, 'public', 'dca-ccc')

const opts = {
  css: 'body{font-family:Segoe UI,Arial;font-size:10pt;line-height:1.35} h1{font-size:18pt;color:#312e81} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ccc;padding:3px}',
  pdf_options: { format: 'A4', margin: '12mm', printBackground: true },
  launch_options: { args: ['--no-sandbox', '--disable-dev-shm-usage'] },
}

function readMd(rel) {
  return readFileSync(join(DOCS, rel), 'utf8')
}

function concat(paths) {
  return paths.map(readMd).join('\n\n---\n\n')
}

async function one(name, paths) {
  const dest = join(OUT, name)
  if (existsSync(dest) && readFileSync(dest).length > 5000) {
    console.log('Skip (exists):', name)
    return
  }
  const content = `# NITA DCA / CCC\n\n${concat(paths)}`
  await mdToPdf({ content }, { ...opts, dest })
  console.log('Wrote', name)
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
  const notes = [
    'notes/01-introduction-to-computer.md', 'notes/02-operating-system.md', 'notes/03-word-processing.md',
    'notes/04-spreadsheet.md', 'notes/05-presentation.md', 'notes/06-internet-web-browsing.md',
    'notes/07-communication-collaboration.md', 'notes/08-digital-financial-services.md',
    'notes/09-e-governance-services.md', 'notes/10-cyber-security.md', 'notes/11-future-skills.md',
  ]
  const qa = (i) => `practice/${String(i).padStart(2, '0')}-${[
    'introduction-to-computer', 'operating-system', 'word-processing', 'spreadsheet', 'presentation',
    'internet-web-browsing', 'communication-collaboration', 'digital-financial-services',
    'e-governance-services', 'cyber-security', 'future-skills',
  ][i - 1]}-qa.md`
  const ak = (i) => qa(i).replace('-qa.md', '-answers.md').replace('practice/', 'practice/answer-keys/')

  await one('DCA-CCC-Study-Notes.pdf', notes)
  await one('DCA-CCC-Student-Part2-Practice-Exams.pdf', [
    ...notes.slice(6), ...[7, 8, 9, 10, 11].map(qa),
    'exam-prep/15-day-study-plan.md', 'exam-prep/ccc-exam-pattern.md',
    'exam-prep/mock-test-01.md', 'exam-prep/mock-test-02.md', 'exam-prep/mock-test-03.md',
    'exam-prep/50-most-important-mcqs.md',
  ])
  await one('DCA-CCC-MCQ-Answers-Modules-1-6.pdf', [1, 2, 3, 4, 5, 6].map(ak))
  await one('DCA-CCC-MCQ-Answers-Modules-7-11.pdf', [7, 8, 9, 10, 11].map(ak))
  await one('DCA-CCC-Mock-Test-Answer-Keys.pdf', [
    'exam-prep/answer-keys/mock-test-01-answers.md',
    'exam-prep/answer-keys/mock-test-02-answers.md',
    'exam-prep/answer-keys/mock-test-03-answers.md',
    'exam-prep/answer-keys/50-most-important-mcqs-answers.md',
  ])
  writeFileSync(join(OUT, 'README.txt'), 'See docs/ncvrt/README.md for PDF list.\n', 'utf8')
  console.log('Done.')
}

main().catch((e) => { console.error(e); process.exit(1) })
