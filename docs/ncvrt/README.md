# DCA / NIELIT CCC 90-Hour Complete Student Pack

**Course:** DCA at NITA Classes — aligned to **NIELIT CCC Revision 4** (Oct 2023+)  
**Duration:** 90 hours — **30 theory + 60 practical**  
**Exam:** 100 MCQs · 90 minutes · no negative marking · **50% pass**

---

## 11 Modules + Exam Prep

| # | Module | Hours | Study Notes | Practice (50 MCQ) |
|---|--------|-------|-------------|-------------------|
| 1 | Introduction to Computer | 10 | [notes/01-introduction-to-computer.md](notes/01-introduction-to-computer.md) | [practice/01-introduction-to-computer-qa.md](practice/01-introduction-to-computer-qa.md) |
| 2 | Operating System | 10 | [notes/02-operating-system.md](notes/02-operating-system.md) | [practice/02-operating-system-qa.md](practice/02-operating-system-qa.md) |
| 3 | Word Processing | 12 | [notes/03-word-processing.md](notes/03-word-processing.md) | [practice/03-word-processing-qa.md](practice/03-word-processing-qa.md) |
| 4 | Spreadsheet | 12 | [notes/04-spreadsheet.md](notes/04-spreadsheet.md) | [practice/04-spreadsheet-qa.md](practice/04-spreadsheet-qa.md) |
| 5 | Presentation | 8 | [notes/05-presentation.md](notes/05-presentation.md) | [practice/05-presentation-qa.md](practice/05-presentation-qa.md) |
| 6 | Internet & Web Browsing | 8 | [notes/06-internet-web-browsing.md](notes/06-internet-web-browsing.md) | [practice/06-internet-web-browsing-qa.md](practice/06-internet-web-browsing-qa.md) |
| 7 | Communication & Collaboration | 8 | [notes/07-communication-collaboration.md](notes/07-communication-collaboration.md) | [practice/07-communication-collaboration-qa.md](practice/07-communication-collaboration-qa.md) |
| 8 | Digital Financial Services | 6 | [notes/08-digital-financial-services.md](notes/08-digital-financial-services.md) | [practice/08-digital-financial-services-qa.md](practice/08-digital-financial-services-qa.md) |
| 9 | E-Governance Services | 6 | [notes/09-e-governance-services.md](notes/09-e-governance-services.md) | [practice/09-e-governance-services-qa.md](practice/09-e-governance-services-qa.md) |
| 10 | Cyber Security | 6 | [notes/10-cyber-security.md](notes/10-cyber-security.md) | [practice/10-cyber-security-qa.md](practice/10-cyber-security-qa.md) |
| 11 | Future Skills | 4 | [notes/11-future-skills.md](notes/11-future-skills.md) | [practice/11-future-skills-qa.md](practice/11-future-skills-qa.md) |
| 12 | **CCC Exam Prep** | — | [exam-prep/15-day-study-plan.md](exam-prep/15-day-study-plan.md) | 3×100 MCQ mocks + 50 important MCQs |

**Answer keys:** [practice/answer-keys/](practice/answer-keys/) and [exam-prep/answer-keys/](exam-prep/answer-keys/) — unlock **last** in each LMS module after completing practice.

---

## Practical Lab Packs

| Software | File |
|----------|------|
| MS Word / Writer | [practical/word-practical-labs.md](practical/word-practical-labs.md) |
| MS Excel / Calc | [practical/excel-practical-labs.md](practical/excel-practical-labs.md) |
| MS PowerPoint / Impress | [practical/ppt-practical-labs.md](practical/ppt-practical-labs.md) |

---

## Exam Prep

| Resource | File |
|----------|------|
| 15-day study plan | [exam-prep/15-day-study-plan.md](exam-prep/15-day-study-plan.md) |
| CCC exam pattern | [exam-prep/ccc-exam-pattern.md](exam-prep/ccc-exam-pattern.md) |
| Mock Test 1 | [exam-prep/mock-test-01.md](exam-prep/mock-test-01.md) |
| Mock Test 2 | [exam-prep/mock-test-02.md](exam-prep/mock-test-02.md) |
| Mock Test 3 | [exam-prep/mock-test-03.md](exam-prep/mock-test-03.md) |
| 50 important MCQs | [exam-prep/50-most-important-mcqs.md](exam-prep/50-most-important-mcqs.md) |

---

## NiTA Student LMS (DCA course)

Enrolled students: **`/student/courses/dca/content`**

| LMS structure | Chapters |
|---------------|----------|
| Modules 1–11 | Study notes → Practice → Answer key (sequential unlock) |
| Modules 3–5 | Extra practical lab pack chapter before answer key |
| Module 12 | 15-day plan → exam pattern → 3 mocks + keys → 50 MCQs + key |

**Regenerate LMS:** `cd server && npm run sync:dca-ccc-lms`

---

## Printable PDFs

Download from **`/dca-ccc/`** after build:

| PDF | Audience |
|-----|----------|
| `DCA-CCC-Study-Notes.pdf` | All 11 module notes |
| `DCA-CCC-Student-Part1-Notes-Practice.pdf` | Modules 1–6 + labs + practice |
| `DCA-CCC-Student-Part2-Practice-Exams.pdf` | Modules 7–11 + mocks |
| `DCA-CCC-MCQ-Answers-Modules-1-6.pdf` | Teacher answer keys |
| `DCA-CCC-MCQ-Answers-Modules-7-11.pdf` | Teacher answer keys |
| `DCA-CCC-Mock-Test-Answer-Keys.pdf` | Mock + 50 MCQ keys |

**Regenerate PDFs:** `cd server && npm run build:dca-ccc-pdf`

---

## Optional bonus material

Legacy NCVRT extras (not in main CCC LMS path): [optional/](optional/)

---

## Maintainer commands

```bash
cd server
npm run generate:dca-ccc-mcqs   # Regenerate 550+ MCQs + mocks
npm run sync:dca-ccc-lms        # Push to academy_course_content.json
npm run build:dca-ccc-pdf       # Build public/dca-ccc PDFs
npm run smoke:dca-ccc           # Verify files + LMS structure
```

---

*NITA Classes — DCA / NIELIT CCC Study Pack*
