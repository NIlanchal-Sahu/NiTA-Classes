import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import { studentPortalApi } from '../../api/student'

function WalletIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
    </svg>
  )
}
function FlameIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  )
}
function BookIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [mini, setMini] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [m, p] = await Promise.all([studentPortalApi.getMiniDashboard(), studentPortalApi.getProfile()])
        setMini(m)
        setProfile(p)
      } catch {
        // silent fallback for dashboard
      }
    })()
  }, [])

  const name = user?.name || user?.email?.split('@')[0] || 'Student'
  const stats = [
    {
      label: 'Wallet balance',
      value: `₹${user?.walletBalance ?? 0}`,
      icon: WalletIcon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    },
    {
      label: 'Classes attended',
      value: user?.totalClassesAttended ?? 0,
      icon: CheckIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Attendance %',
      value: `${mini?.attendancePercentage ?? 0}%`,
      icon: BookIcon,
      color: 'text-violet-400',
      bg: 'bg-violet-500/20',
    },
    {
      label: 'Rewards Earned',
      value: `₹${mini?.rewards ?? 0}`,
      icon: FlameIcon,
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
    },
  ]

  const exploreCourses = [
    { id: 'dca', title: 'DCA (Basic Computer Course) - Quick & Short Term' },
    { id: 'cca', title: 'CCA - Computer Application (PGDCA / O Level Equivalent)' },
    { id: 'spoken-english-mastery', title: 'Spoken English Mastery (Advance Level)' },
    { id: 'ai-associate', title: 'Artificial Intelligent Associate (AI Dev with Python)' },
    { id: 'ai-video-creation', title: 'AI Video Creation Course' },
  ]

  if (profile && profile.isLinked === false) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold text-gray-900">Link Student ID to Continue</h1>
        <p className="mt-2 text-gray-600 text-sm">
          We couldn't permanently match your login with a Student ID. Please link it once.
        </p>
        <Link
          to="/student/link-student"
          className="mt-6 inline-flex w-full justify-center rounded-xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Link Student ID
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-white">Welcome back, {name}! 👋</h2>
        <p className="mt-1 text-gray-400">Continue your learning journey...</p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="text-sm font-semibold text-white">Student Profile</h3>
        <div className="mt-2 grid gap-2 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-4">
          <div>Student ID: <span className="text-white">{profile?.student?.id || '—'}</span></div>
          <div>Phone: <span className="text-white">{profile?.student?.phone || '—'}</span></div>
          <div>Class/Batch: <span className="text-white">{profile?.student?.batchId || '—'}</span></div>
          <div>Admission: <span className="text-white">{profile?.student?.admissionDate || '—'}</span></div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
            <div className={`inline-flex rounded-lg p-2 ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Link to="/student/pay" className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300">
          Pay for class (scan QR) →
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="text-sm font-semibold text-white">Mini Dashboard</h3>
        <div className="mt-2 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
          <div>Course Progress: <span className="text-white">{mini?.courseProgress ?? 0}%</span></div>
          <div>Earned by Referring: <span className="text-white">₹{mini?.earnedByReferring ?? 0}</span></div>
          <div>Achievements: <span className="text-white">{(mini?.achievements || []).join(', ') || '—'}</span></div>
          <div>Wallet Balance: <span className="text-white">₹{mini?.walletBalance ?? user?.walletBalance ?? 0}</span></div>
        </div>
      </div>

      {!bannerDismissed && (
        <div className="mt-8 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-violet-600 to-violet-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⭐</span>
            <div>
              <h3 className="text-lg font-bold text-white">Expand Your Skills</h3>
              <p className="mt-1 text-violet-100">Explore our comprehensive course catalog</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/student/explore"
              className="btn-touch rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50"
            >
              Explore →
            </Link>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="btn-touch rounded-lg p-2 text-white/80 hover:bg-white/10"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-bold text-white">All Courses</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {exploreCourses.map((c) => (
            <div key={c.id} className="group overflow-hidden rounded-xl border border-gray-700 bg-gray-800 transition hover:border-gray-600">
              <div className="relative aspect-video bg-gray-700">
                <img src="/qr-dummy.png" alt="" className="h-full w-full object-cover opacity-70" />
                <span className="absolute left-2 top-2 rounded bg-red-600/90 px-2 py-1 text-xs font-medium text-white">LOCKED</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-white line-clamp-2">{c.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

