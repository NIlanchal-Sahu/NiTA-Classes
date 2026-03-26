import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import studentRoutes from './routes/student.js'
import enrollmentsRoutes from './routes/enrollments.js'
import batchesRoutes from './routes/batches.js'
import notificationsRoutes from './routes/notifications.js'
import publicEnrollmentsRoutes from './routes/publicEnrollments.js'
import referralsRoutes from './routes/referrals.js'
import academyRoutes from './routes/academy.js'
import studentProfileRoutes from './routes/studentProfile.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { bootstrapDataFromSheets, getSheetsStoreStatus } from './services/sheetsJsonStore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(join(__dirname, 'uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/student', studentProfileRoutes)
app.use('/api/student/referrals', referralsRoutes)
app.use('/api/public/enrollments', publicEnrollmentsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/academy', academyRoutes)
app.use('/api/admin/enrollments', enrollmentsRoutes)
app.use('/api/admin/batches', batchesRoutes)
app.use('/api/admin/notifications', notificationsRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))
app.get('/api/health/storage', (_, res) => {
  const storage = getSheetsStoreStatus()
  res.json({ ok: true, storage })
})

bootstrapDataFromSheets()
  .catch((e) => {
    console.warn('[bootstrap] Google Sheets bootstrap failed:', e.message)
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Auth server running at http://localhost:${PORT}`)
    })
  })
