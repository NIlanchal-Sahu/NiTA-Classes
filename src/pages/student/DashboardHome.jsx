import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import { studentPortalApi } from '../../api/student'

const DEFAULT_BATCH_GROUP_URL = 'https://chat.whatsapp.com/G5HVGAshx7r7BYnz7PoeRs?mode=gi_t'

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
  const { user, refreshUser } = useAuth()
  const walletBalance = Number(user?.walletBalance) || 0
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [mini, setMini] = useState(null)
  const [profile, setProfile] = useState(null)
  const [coursesData, setCoursesData] = useState(null)
  const [unlockModal, setUnlockModal] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [m, p, c] = await Promise.all([
          studentPortalApi.getMiniDashboard(),
          studentPortalApi.getProfile(),
          studentPortalApi.getCoursesLearning(),
        ])
        setMini(m)
        setProfile(p)
        setCoursesData(c)
      } catch {
        // silent fallback for dashboard
      }
    })()
  }, [])

  const name = user?.name || user?.email?.split('@')[0] || 'Student'
  const profileBatchId = profile?.student?.batchId || ''
  const displayBatchName =
    coursesData?.assignedBatches?.length > 0
      ? coursesData.assignedBatches.map((b) => b.name || b.title).filter(Boolean).join(', ')
      : coursesData?.assignedBatch?.name || coursesData?.assignedBatch?.title || profileBatchId || '—'
  const batchGroupUrl =
    coursesData?.assignedBatch?.whatsappGroupLink ||
    coursesData?.assignedBatch?.batchGroupLink ||
    coursesData?.assignedBatch?.groupLink ||
    DEFAULT_BATCH_GROUP_URL

  const unlockModalFee = unlockModal
    ? unlockModal.mode === 'renew'
      ? Number(unlockModal.renewFee) || 0
      : Number(unlockModal.unlockFee) || 0
    : 0
  const unlockModalInsufficient = Boolean(unlockModal && walletBalance < unlockModalFee)
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
          <div>Class/Batch: <span className="text-white">{displayBatchName}</span></div>
          <div>Admission: <span className="text-white">{profile?.student?.admissionDate || '—'}</span></div>
        </div>
        <div className="mt-3">
          <a
            href={batchGroupUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Join Batch Group
          </a>
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
        {coursesData?.trialInfo && (
          <div className="mt-3 rounded-xl border border-blue-700 bg-blue-900/20 p-4 text-sm text-blue-100">
            <div className="font-semibold">{coursesData.trialInfo.title}</div>
            {coursesData.trialInfo.status === 'active' ? (
              <div>Expires in {coursesData.trialInfo.daysLeft} day(s) · {coursesData.trialInfo.expiresAt}</div>
            ) : (
              <div>Completed on {coursesData.trialInfo.expiresAt}</div>
            )}
          </div>
        )}
        {actionError && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {actionError}
          </div>
        )}
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(coursesData?.allCourses || []).map((c) => (
            <div key={c.id} className="group overflow-hidden rounded-xl border border-gray-700 bg-gray-800 transition hover:border-gray-600">
              <div className="relative aspect-video bg-gray-700">
                <img src="/qr-dummy.png" alt="" className="h-full w-full object-cover opacity-70" />
                <span className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-medium text-white ${c.status === 'locked' ? 'bg-red-600/90' : c.status === 'completed' ? 'bg-amber-600/90' : 'bg-emerald-600/90'}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-white line-clamp-2">{c.name || c.title}</p>
                <p className="mt-1 text-xs text-gray-300">Unlock fee: ₹{c.unlockFee}</p>
                {c.status === 'active' && <p className="mt-1 text-xs text-emerald-300">Expires in {c.daysLeft} day(s)</p>}
                {c.status === 'completed' && <p className="mt-1 text-xs text-amber-300">Completed · Renew at 40% discount: ₹{c.renewFee}</p>}
                <div className="mt-3">
                  {c.status === 'locked' ? (
                    <button
                      type="button"
                      onClick={() => setUnlockModal({ mode: 'unlock', ...c })}
                      className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      Unlock
                    </button>
                  ) : c.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => setUnlockModal({ mode: 'renew', ...c })}
                      className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      Renew Course
                    </button>
                  ) : (
                    <Link to={`/student/course/${c.id}`} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                      Open Course
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {unlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">
              {unlockModal.mode === 'renew' ? 'Renew course?' : 'Unlock course?'}
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              <span className="font-semibold text-white">{unlockModal.name || unlockModal.title}</span>
            </p>
            <p className="mt-2 text-sm text-amber-300">
              {unlockModal.mode === 'renew'
                ? `Renew fee ₹${unlockModalFee} (40% discount) will be deducted from wallet.`
                : `Course unlock fee ₹${unlockModalFee} will be deducted from wallet.`}
            </p>
            {unlockModalInsufficient && (
              <p className="mt-2 text-sm text-red-300">
                Insufficient wallet balance. Please add balance first.
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setUnlockModal(null)
                  setActionError('')
                }}
                className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              {unlockModalInsufficient ? (
                <Link
                  to="/student/pay"
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white hover:bg-blue-700"
                >
                  Add Balance
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setActionError('')
                    try {
                      if (unlockModal.mode === 'renew') {
                        await studentPortalApi.renewCourse(unlockModal.id)
                      } else {
                        await studentPortalApi.unlockCourse(unlockModal.id, true)
                      }
                      setUnlockModal(null)
                      await refreshUser()
                      const [m, p, c] = await Promise.all([
                        studentPortalApi.getMiniDashboard(),
                        studentPortalApi.getProfile(),
                        studentPortalApi.getCoursesLearning(),
                      ])
                      setMini(m)
                      setProfile(p)
                      setCoursesData(c)
                    } catch (e) {
                      setActionError(e.message || 'Action failed')
                    }
                  }}
                  className="flex-1 rounded-lg bg-violet-600 py-2.5 font-medium text-white hover:bg-violet-700"
                >
                  {unlockModal.mode === 'renew' ? 'Confirm renewal' : 'Confirm unlock'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

