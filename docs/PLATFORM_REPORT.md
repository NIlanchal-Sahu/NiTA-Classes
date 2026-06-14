# NITA Classes — Portal + LMS Technical Report

**Document version:** 1.0  
**Last updated:** May 2026  
**Project:** NiTA Classes (coaching institute — computer skills, AI, spoken English, school IT)

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [High-level architecture](#2-high-level-architecture)
3. [Application surfaces](#3-application-surfaces)
4. [Backend API map](#4-backend-api-map)
5. [Data layer](#5-data-layer)
6. [Underlying technologies](#6-underlying-technologies)
7. [Deployment & operations](#7-deployment--operations)
8. [Strengths of the current design](#8-strengths-of-the-current-design)
9. [Known limitations & technical debt](#9-known-limitations--technical-debt)
10. [Future upgradation recommendations](#10-future-upgradation-recommendations)
11. [Course catalog](#11-course-catalog)
12. [Conclusion](#12-conclusion)

---

## 1. Executive summary

**NITA Classes** is a full-stack coaching institute platform for computer skills, AI courses, spoken English, and school IT (+2/OAV). It is not a thin brochure site: it includes authentication, wallet-based pay-per-class (₹10/class), course unlocks, structured LMS content (modules/chapters/videos), attendance, fees, referrals, certificates, and a large admin surface for operations.

The system is intentionally **pragmatic for a small institute**: React SPA + Express API, **file-based JSON databases** mirrored to **Google Sheets**, with **Google Drive** for documents, profiles, and course materials. Production is split: **static frontend** (Vercel/Netlify) and **API** (e.g. Render), connected via proxy rewrites.

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                            │
│  Public pages │ Student portal (/student) │ Admin (/admin)     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│              Vercel / Netlify (static dist/)                     │
│              vercel.json: /api/* → Render backend                │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Express API (Node.js, port 3001)                      │
│  /api/auth  /api/student  /api/admin/academy  …                  │
└──────┬─────────────────┬──────────────────┬─────────────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
  JSON files      server/uploads/    Google Sheets + Drive
  (server/data)                      (optional sync)
```

| Layer | Role |
|--------|------|
| **Frontend** | React 18 SPA (Vite), React Router, Tailwind CSS |
| **Backend** | Express 5 REST API, JWT auth, role-based access |
| **Data** | JSON files on disk; optional bidirectional sync to Google Sheets |
| **Files** | Local uploads + Google Drive (profiles, receipts, chapter PDFs) |
| **Deploy** | Frontend static; API on Render (per `vercel.json`) |

---

## 3. Application surfaces

### 3.1 Public portal (`/`)

Routes under `PublicLayout`: marketing and lead capture.

| Route | Purpose |
|--------|---------|
| `/` | Home — hero, courses teaser, WhatsApp CTA, program date |
| `/courses` | Course catalog |
| `/admission` | Admission form → `FORM_ENDPOINT` (Google Apps Script / Formspree) |
| `/about`, `/contact` | Institute info, map, contact |
| `/referral` | Referral program landing |
| `/internship` | Internship poster + Google Form link |
| `/login` | Role-based login (student / teacher / admin) |

**Integrations:** WhatsApp floating button, social links, SEO meta tags in `index.html`, Plus Jakarta Sans typography.

**Key files:** `src/pages/Home.jsx`, `src/config.js`, `src/components/Navbar.jsx`, `src/components/WhatsAppButton.jsx`

### 3.2 Student portal (`/student/*`)

Protected by `ProtectedRoute` with `requireRole="student"`. Dark-themed LMS-style UI (`StudentLayout`).

| Route | Feature |
|--------|---------|
| `/student` | Dashboard — wallet, batch, unlock prompts |
| `/student/pay` | Pay for class (₹10), wallet recharge, VVIP unlimited month |
| `/student/my-courses` | Enrolled courses |
| `/student/explore` | Discover and unlock courses |
| `/student/learning-paths` | Structured learning navigation |
| `/student/course/:courseId` | Module/chapter content, video embeds, completion |
| `/student/profile` | Student profile (Aadhaar, photos, Drive sync) |
| `/student/link-student` | Claim academy record by phone |
| `/student/referrals` | Refer & earn |
| `/student/achievements` | Progress, certificates, leaderboard-style stats |
| `/student/settings`, `/student/help` | Account and support |

**Business rules (code-defined):**

- Per-class wallet: **₹10/class**
- Course unlock fees (examples): DCA ₹499, CCA ₹999, AI Associate ₹1499, Spoken English ₹499
- Access durations: 60–180 days per course (see `server/src/routes/student.js`)
- VVIP unlimited month: **₹699**

### 3.3 Admin / teacher academy (`/admin/*`)

Protected for `admin` and `teacher` roles. Primary backend: `/api/admin/academy`.

| Module | Capabilities |
|--------|----------------|
| **Dashboard** | Lifecycle stats, course-wise unlocks, referral analytics |
| **Students** | CRUD, enrollments, archive, password reset |
| **Teachers** | CRUD, attendance, requests, payments |
| **Courses** | Academy catalog management |
| **Course content** | Modules/chapters; Quill rich text; PDF/DOC → Drive |
| **Batches** | Scheduling, WhatsApp links, lifecycle status |
| **Attendance** | Marking, monthly reports |
| **Fees** | Payments; approve student payment requests → wallet credit |
| **Discounts** | Promotional pricing |
| **Notes** | Admin/student notes |
| **Certificates** | Issue + student requests |
| **Student profiles** | Review KYC-style data and documents |
| **Enrollments** | Admission queue |
| **Notifications** | Broadcast to students |
| **Referrals** | Partners, payouts, review requests |

**Note:** `src/pages/AdminPanel.jsx` is a legacy placeholder. Full admin work is at `/admin`.

---

## 4. Backend API map

| Prefix | Responsibility |
|--------|----------------|
| `POST/GET /api/auth/*` | Login, OTP request/verify, `/me`, password change |
| `GET/POST /api/student/*` | Wallet scan, profile, full student portal |
| `GET/POST /api/student/referrals/*` | Student referral actions |
| `GET/POST /api/admin/*` | Legacy admin stats (attendance revenue MVP) |
| `GET/POST /api/admin/academy/*` | Full academy operations |
| `GET/POST /api/admin/enrollments` | Enrollment management |
| `GET/POST /api/admin/batches` | Batch management |
| `GET/POST /api/admin/notifications` | Notifications |
| `POST /api/public/enrollments` | Public admission API |
| `GET /api/health` | Health check |
| `GET /api/health/storage` | Google Sheets sync status |

### Authentication model

| Aspect | Implementation |
|--------|----------------|
| Tokens | JWT (`jsonwebtoken`), default expiry 7 days |
| Passwords | bcrypt (10 salt rounds) |
| OTP | In-memory store, 10 min TTL; dev exposes OTP in API |
| Roles | `student`, `teacher`, `admin` |
| Student login | Email, 10-digit mobile, or `NITA…` student ID |
| Teacher login | Email, username, or mobile |

**Key files:** `server/src/auth.js`, `server/src/routes/auth.js`

---

## 5. Data layer

### 5.1 JSON database files

Location: `server/src/data/`

| File | Purpose |
|------|---------|
| `users.json` | Auth accounts (gitignored) |
| `users.example.json` | Bootstrap template |
| `students.json` | Academy student records |
| `student_enrollments.json` | Enrollment history |
| `student_profiles.json` | Profile/KYC data |
| `academy_courses.json` | Course catalog |
| `academy_batches.json` | Batches |
| `academy_course_content.json` | Modules/chapters metadata |
| `academy_student_progress.json` | Chapter completion |
| `academy_attendance.json` | Academy attendance |
| `academy_fees.json`, `academy_discounts.json` | Fees and discounts |
| `academy_certificates.json`, `certificate_requests.json` | Certificates |
| `attendance.json` | Wallet / pay-per-class attendance |
| `courses.json` | Legacy course list (scan-to-pay) |
| `payment_requests.json` | Student payment approvals |
| `enrollments.json` | Public admission queue |
| `referrals.json`, `referral_links.json`, `referral_payouts.json` | Referral system |
| `student_notifications.json`, `admin_alerts.json` | Alerts |

### 5.2 Google Sheets mirror

**Service:** `server/src/services/sheetsJsonStore.js`

- Each JSON file → Sheet tab `db_<filename>` (e.g. `db_users`)
- Full JSON stored in cell **B2**
- Startup: bootstrap pulls Sheets → local JSON
- On write: save locally + async mirror to Sheets

**Environment variables:**

- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON` or `GOOGLE_SERVICE_ACCOUNT_PATH`
- `GOOGLE_SHEETS_DB_ENABLED` (default true)

**User sync script:** `npm run sync:users:merge` (from `server/`)

### 5.3 Google Drive

| Folder / use | Path pattern |
|--------------|--------------|
| Student profiles | `NITA_Students/FullName_userId/` |
| Payment receipts | `NITA_Payment_Receipts` |
| Course chapter files | `NITA_Course_Content/Course_*/Module_*/Chapter_*` |

See also: `docs/STUDENT_PROFILE_GOOGLE.md`, `server/src/services/googleProfileSync.js`, `server/src/services/courseContentDrive.js`

---

## 6. Underlying technologies

### 6.1 Frontend

| Technology | Version | Use |
|------------|---------|-----|
| React | 18.2 | UI |
| Vite | 5.1 | Build tool, dev server |
| React Router | 6.22 | Routing |
| Tailwind CSS | 3.4 | Styling |
| Quill / react-quill | 2.x | Admin rich text editor |
| PostCSS / Autoprefixer | — | CSS pipeline |
| concurrently | 9.x | `npm run dev:all` |

### 6.2 Backend

| Technology | Version | Use |
|------------|---------|-----|
| Node.js (ES modules) | — | Runtime |
| Express | 5.2 | HTTP API |
| jsonwebtoken | 9.x | JWT |
| bcryptjs | 3.x | Password hashing |
| cors | 2.x | CORS |
| dotenv | 17.x | Config |
| googleapis | 144.x | Sheets + Drive |
| multer | 1.x | File uploads |
| nodemailer | 8.x | Dependency present; OTP email not wired |
| nodemon | 3.x | Dev reload |

### 6.3 External services

| Service | Usage |
|---------|--------|
| Vercel | Frontend + API proxy to Render |
| Netlify | Alternative static host |
| Render | Hosted API (`nita-classes-api.onrender.com`) |
| Google Sheets | JSON backup / sync |
| Google Drive | Files, optional wallet QR URLs |
| Google Apps Script | Admission form (configurable) |
| WhatsApp | CTAs, batch group links |
| UPI | PhonePe, Paytm, Amazon Pay |

### 6.4 Project structure

```
├── src/                    # React frontend
│   ├── pages/              # Public + student pages
│   ├── admin/              # Admin academy UI
│   ├── api/                # API clients
│   ├── context/            # AuthContext
│   ├── layouts/            # Public, Student layouts
│   └── components/
├── server/src/
│   ├── routes/             # Express routers
│   ├── services/           # Sheets, Drive, sync
│   ├── data/               # JSON persistence
│   └── uploads/            # Local file storage
├── docs/                   # Documentation
├── public/                 # Static assets
├── vercel.json
├── netlify.toml
├── vite.config.js
└── package.json            # Root + server packages
```

---

## 7. Deployment & operations

### Local development

```bash
npm install
cd server && npm install && cd ..
npm run dev:all
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001  
- Vite proxies `/api` and `/uploads` to the API

### Production build

```bash
npm run build
```

Output: `dist/` — deploy to Vercel, Netlify, or any static host.

### Environment (server)

Copy `server/.env.example` → `server/.env`. Critical variables:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Token signing (change in production) |
| `PORT` | API port (default 3001) |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Sheets sync |
| `GOOGLE_SERVICE_ACCOUNT_*` | Sheets/Drive auth |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | Drive uploads |
| `WALLET_QR_DRIVE_URL_*` | Optional QR images from Drive |

### Deployment topology

1. **Frontend:** Vercel (or Netlify) serves `dist/`
2. **API:** Render (or similar) runs `node server/src/index.js`
3. **Proxy:** `vercel.json` rewrites `/api/*` → Render backend

See: `docs/VERCEL_API_PROXY.md`

### Health checks

- `GET /api/health` → `{ "ok": true }`
- `GET /api/health/storage` → Sheets configuration status

---

## 8. Strengths of the current design

1. **End-to-end institute ops** — marketing, LMS, fees, attendance, referrals in one repo.
2. **Low operational cost** — no paid database required; Sheets as backup and ops UI.
3. **India-specific flows** — UPI wallet, ₹10/class, WhatsApp, bilingual course content.
4. **Clear role separation** — student, teacher, admin with route guards.
5. **Flexible content** — YouTube/Drive/Vimeo embeds; PDF uploads per chapter.
6. **Recoverability** — bootstrap from Google Sheets after clone or redeploy.

---

## 9. Known limitations & technical debt

| Area | Issue |
|------|--------|
| **Database** | JSON files — no transactions, concurrency, or relational queries |
| **OTP email** | Nodemailer listed but OTP not sent via SMTP in `auth.js` |
| **OTP storage** | In-memory only; lost on restart; not shared across instances |
| **Scalability** | Single-node file writes; cold starts on free hosting |
| **AdminPanel.jsx** | Legacy placeholder vs full `/admin` app |
| **Dual attendance** | `attendance.json` vs `academy_attendance.json` |
| **Dual course lists** | `courses.json` vs `academy_courses.json` |
| **Security** | Default dev JWT secret; permissive CORS in dev |
| **Testing** | No automated test suite |
| **FORM_ENDPOINT** | May still be placeholder in some environments |

---

## 10. Future upgradation recommendations

### 10.1 Short term (1–3 months)

| Priority | Upgrade | Rationale |
|----------|---------|-----------|
| High | Wire SMTP for OTP | Production-ready login; remove dev OTP in API |
| High | Redis for OTP/sessions | Survive restarts; multi-instance API |
| High | PostgreSQL or MongoDB | Reliable data, reporting, concurrency |
| High | Payment gateway (Razorpay, etc.) | Automate wallet top-ups |
| Medium | Unify attendance & course models | Single source of truth |
| Medium | Remove legacy AdminPanel route | Clear admin entry |
| Medium | E2E tests (Playwright) | Regression safety |
| Medium | Rate limiting + security headers | Protect auth endpoints |

### 10.2 Medium term (3–6 months)

| Upgrade | Rationale |
|---------|-----------|
| Teacher PWA / mobile-friendly attendance | Classroom workflow |
| Live classes (Meet/Zoom links per batch) | Remote/hybrid teaching |
| Assignments & quizzes | Assessment and gradebook |
| Push notifications (Firebase) | Fee due, class reminders |
| Analytics dashboard | Retention, revenue by course |
| CDN for media | Faster delivery than Drive embeds alone |
| UI i18n (Odia/Hindi) | Match student audience |
| Certificate PDF generation | Branded certs with passport photo |

### 10.3 Long term (6–12+ months)

| Upgrade | Rationale |
|---------|-----------|
| Multi-branch / franchise | Scale operations |
| Parent portal | Child progress and fees |
| AI tutor / FAQ bot | Support at scale |
| SCORM / xAPI | School partnerships |
| React Native mobile apps | Offline, push, biometric login |
| Data compliance (export/delete) | Privacy readiness |
| Observability (Sentry, logging) | Production reliability |
| CI/CD (GitHub Actions) | Lint, test, preview deploys |

### 10.4 Suggested future architecture

```
React SPA  →  API (Express/Nest)  →  PostgreSQL
                    ↓
                 Redis (sessions/OTP)
                    ↓
              S3 + CDN (media)
                    ↓
              Razorpay (payments)
                    ↓
         Background workers (email, reports)
```

---

## 11. Course catalog

As configured in `courses.json` / `academy_courses.json`:

| ID | Name |
|----|------|
| `dca` | DCA (Basic Computer Course) |
| `cca` | CCA (Computer Application - PGDCA / O Level) |
| `spoken-english-mastery` | Spoken English Mastery (Advance Level) |
| `ai-associate` | Artificial Intelligent Associate (AI Dev with Python) |
| `ai-video-creation` | AI Video Creation Course |
| `ai-vibe-coding` | AI Vibe Coding |
| `plus2-it-arts-science-oav` | +2 IT Arts/Science/OAV |
| `oav-ict-6th-10th` | OAV - ICT 6th-10th |

**Pricing models:** Per-class ₹10 (wallet) and lump-sum course unlock fees with time-limited access.

---

## 12. Conclusion

**NITA Classes** is a production-oriented institute platform combining a marketing portal, wallet-based micro-payments, a module/chapter LMS, and a broad admin academy system. Google Sheets and Drive serve as the operational backbone for a small team without a dedicated database administrator.

The stack is modern on the surface (React 18, Vite, Express 5, Tailwind) but file- and sheet-backed for simplicity. The highest-value upgrades are real database persistence, production-grade authentication (OTP email + shared session store), payment automation, and consolidating duplicate data models — then layering teaching features (assignments, live class, mobile PWA) as the institute scales.

---

## Related documentation

| Document | Topic |
|----------|--------|
| `README.md` | Quick start, deployment checklist |
| `docs/STUDENT_PROFILE_GOOGLE.md` | Google Drive & Sheets for profiles |
| `docs/VERCEL_API_PROXY.md` | Vercel → Render API proxy |
| `server/.env.example` | Server environment variables |

---

*This report was generated from codebase analysis of the NiTA Classes repository.*
