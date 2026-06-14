/**
 * Build DCA CCC printable PDF bundles (batched to avoid Puppeteer size limits).
 * Run: node server/scripts/build-dca-ccc-pdf-bundle.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mdToPdf } from 'md-to-pdf'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const DOCS = join(ROOT, 'docs', 'ncvrt')
const OUT = join(ROOT, 'public', 'dca-ccc')

const PDF_CSS = `
body { font-family: Segoe UI, Arial, sans-serif; font-size: 10pt; line-height: 1.35; color: #111; }
h1 { font-size: 18pt; color: #312e81; page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
h2 { font-size: 13pt; color: #4338ca; }
table { border-collapse: collapse; width: 100%; font-size: 9pt; }
th, td { border: 1px solid #ccc; padding: 3px 5px; }
th { background: #eef2ff; }
.page-break { page-break-after: always; }
`

const pdfOpts = {
  css: PDF_CSS,
  pdf_options: {
    format: 'A4',
    margin: { top: '14mm', right: '10mm', bottom: '14mm', left: '10mm' },
    printBackground: true,
  },
  launch_options: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
}

function readMd(rel) {
  return readFileSync(join(DOCS, rel), 'utf8')
}

function pb() {
  return '\n\n<div class="page-break"></div>\n\n'
}

function concat(paths) {
  return paths.map(readMd).join(pb())
}

async function writePdf(name, content) {
  const dest = join(OUT, name)
  await mdToPdf({ content }, { ...pdfOpts, dest })
  console.log('Wrote', dest)
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

  const header = `# NITA DCA / NIELIT CCC 90-Hour Pack\n\n`

  const notePaths = [
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

  const practiceQa = notePaths.map((n) => `practice/${n.replace('notes/', '').replace('.md', '')}-qa.md`)
  const practiceKeys = practiceQa.map((p) => p.replace('-qa.md', '-answers.md').replace('practice/', 'practice/answer-keys/'))

  const practical = [
    'practical/word-practical-labs.md',
    'practical/excel-practical-labs.md',
    'practical/ppt-practical-labs.md',
  ]

  const examStudent = [
    'exam-prep/15-day-study-plan.md',
    'exam-prep/ccc-exam-pattern.md',
    'exam-prep/mock-test-01.md',
    'exam-prep/mock-test-02.md',
    'exam-prep/mock-test-03.md',
    'exam-prep/50-most-important-mcqs.md',
  ]

  const examKeys = [
    'exam-prep/answer-keys/mock-test-01-answers.md',
    'exam-prep/answer-keys/mock-test-02-answers.md',
    'exam-prep/answer-keys/mock-test-03-answers.md',
    'exam-prep/answer-keys/50-most-important-mcqs-answers.md',
  ]

  await writePdf('DCA-CCC-Study-Notes.pdf', header + concat(notePaths))

  // Batch student pack (notes + practical + practice + exams) in 2 parts
  await writePdf(
    'DCA-CCC-Student-Part1-Notes-Practice.pdf',
    header + concat([...notePaths.slice(0, 6), ...practical, ...practiceQa.slice(0, 6)]),
  )
  await writePdf(
    'DCA-CCC-Student-Part2-Practice-Exams.pdf',
    header + concat([...notePaths.slice(6), ...practiceQa.slice(6), ...examStudent]),
  )

  // Teacher keys in batches
  await writePdf('DCA-CCC-MCQ-Answers-Modules-1-6.pdf', header + concat(practiceKeys.slice(0, 6)))
  await writePdf('DCA-CCC-MCQ-Answers-Modules-7-11.pdf', header + concat(practiceKeys.slice(6)))
  await writePdf('DCA-CCC-Mock-Test-Answer-Keys.pdf', header + concat(examKeys))

  writeFileSync(
    join(OUT, 'README.txt'),
    `NITA Classes — DCA / CCC Printable PDFs
=====================================

Student downloads:
- DCA-CCC-Study-Notes.pdf (all 11 modules)
- DCA-CCC-Student-Part1-Notes-Practice.pdf
- DCA-CCC-Student-Part2-Practice-Exams.pdf

Teacher downloads:
- DCA-CCC-MCQ-Answers-Modules-1-6.pdf
- DCA-CCC-MCQ-Answers-Modules-7-11.pdf
- DCA-CCC-Mock-Test-Answer-Keys.pdf

Regenerate: cd server && npm run build:dca-ccc-pdf
LMS sync: cd server && npm run sync:dca-ccc-lms
`,
    'utf8',
  )

  console.log('PDF bundle complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
