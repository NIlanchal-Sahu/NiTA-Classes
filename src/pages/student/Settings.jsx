import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import { studentPortalApi } from '../../api/student'
import * as authApi from '../../api/auth'

function InfoTile({ icon, label, value, mono }) {
  return (
    <div className="rounded-xl border border-gray-700/80 bg-gray-900/50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-lg">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className={`mt-0.5 truncate text-sm font-semibold text-white ${mono ? 'font-mono text-xs sm:text-sm' : ''}`}>
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ to, icon, label, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-gray-700/80 bg-gray-900/40 p-4 transition hover:border-violet-500/40 hover:bg-violet-500/5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-xl group-hover:bg-violet-600/30">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [coursesLearning, setCoursesLearning] = useState(null)
  const [profileDetails, setProfileDetails] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [out, learn, details] = await Promise.all([
          studentPortalApi.getProfile(),
          studentPortalApi.getCoursesLearning().catch(() => null),
          studentPortalApi.getStudentProfileDetails().catch(() => null),
        ])
        setProfile(out)
        setCoursesLearning(learn)
        setProfileDetails(details?.profile || null)
      } catch {
        try {
          const out = await studentPortalApi.getProfile()
          setProfile(out)
        } catch {
          /* ignore */
        }
      }
    })()
  }, [])

  const studentId = user?.studentId || profile?.student?.id || '—'
  const displayName = user?.name || profileDetails?.fullName || 'Student'
  const loginId = user?.email || profile?.student?.phone || profileDetails?.mobile || '—'

  const batchDisplay = useMemo(() => {
    const list =
      Array.isArray(coursesLearning?.assignedBatches) && coursesLearning.assignedBatches.length > 0
        ? coursesLearning.assignedBatches
        : coursesLearning?.assignedBatch
          ? [coursesLearning.assignedBatch]
          : []
    if (list.length) {
      return list
        .map((b) => {
          const name = b.name || b.title || b.id || '—'
          const timing = b.timing ? ` · ${b.timing}` : ''
          return `${name}${timing}`
        })
        .join(' · ')
    }
    return profile?.student?.batchId || 'Not assigned yet'
  }, [coursesLearning, profile])

  const enrolledCourses = useMemo(() => {
    const fromLearn = coursesLearning?.enrolledCourses || coursesLearning?.myCourses || []
    if (Array.isArray(fromLearn) && fromLearn.length) {
      return fromLearn.map((c) => c.name || c.id).filter(Boolean).join(', ')
    }
    const code = profile?.student?.courseEnrolled
    if (!code) return '—'
    const found = (coursesLearning?.allCourses || []).find(
      (c) => String(c.id).toLowerCase() === String(code).toLowerCase(),
    )
    return found?.name || code
  }, [coursesLearning, profile])

  const profileComplete = useMemo(() => {
    const p = profileDetails
    if (!p) return null
    const checks = [
      p.fullName,
      p.dateOfBirth,
      p.mobile,
      p.email,
      p.aadhaarNumber,
      p.fullAddress,
      p.highestQualification,
      p.passportPhotoPublicUrl || p.profilePhotoPublicUrl,
    ]
    const done = checks.filter((v) => String(v || '').trim()).length
    return Math.round((done / checks.length) * 100)
  }, [profileDetails])

  const walletBalance = Number(user?.walletBalance) || 0
  const classesAttended = Number(user?.totalClassesAttended) || 0
  const enrolledCount = coursesLearning?.enrolledCourses?.length || coursesLearning?.myCourses?.length || 0

  const copyStudentId = async () => {
    if (!studentId || studentId === '—') return
    try {
      await navigator.clipboard.writeText(studentId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwdErr('')
    setPwdMsg('')
    if (newPassword.length < 6) {
      setPwdErr('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match')
      return
    }
    setPwdLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setPwdMsg('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (err) {
      setPwdErr(err.message || 'Failed to update password')
    } finally {
      setPwdLoading(false)
    }
  }

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-white">My Account</h1>
      <p className="mt-1 text-sm text-gray-400">Your login details, class info, and security settings in one place.</p>

      {profile && profile.isLinked === false && (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
          <p className="font-semibold text-amber-100">Link your Student ID</p>
          <p className="mt-1 text-sm text-amber-200/80">
            Connect your academy ID so attendance, fees, and certificates show correctly.
          </p>
          <Link
            to="/student/link-student"
            className="mt-4 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400"
          >
            Link Student ID
          </Link>
        </div>
      )}

      {/* Profile hero */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 via-gray-900 to-gray-900 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-2xl border-2 border-violet-400/50 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-violet-400/50 bg-violet-600/30 text-2xl font-bold text-white">
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-gray-800/80 px-2.5 py-1 font-mono text-xs text-violet-200">{studentId}</span>
              <button
                type="button"
                onClick={copyStudentId}
                className="rounded-lg border border-gray-600 px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-gray-800"
              >
                {copiedId ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">Login: {loginId}</p>
          </div>
          <Link
            to="/student/profile"
            className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500"
          >
            Edit profile
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-300">₹{walletBalance}</p>
            <p className="text-[11px] text-gray-500">Wallet</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{classesAttended}</p>
            <p className="text-[11px] text-gray-500">Classes attended</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{enrolledCount || '—'}</p>
            <p className="text-[11px] text-gray-500">Courses enrolled</p>
          </div>
        </div>
      </div>

      {/* Certificate profile status */}
      {profileComplete != null && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Certificate profile</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {profileComplete >= 100
                  ? 'All essential details saved — ready for certificates.'
                  : 'Add name, Aadhaar, and photo for your course certificate.'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                profileComplete >= 100
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : profileComplete >= 50
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-red-500/20 text-red-300'
              }`}
            >
              {profileComplete}% complete
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
              style={{ width: `${profileComplete}%` }}
            />
          </div>
          {profileComplete < 100 && (
            <Link
              to="/student/profile"
              className="mt-3 inline-flex text-sm font-semibold text-violet-300 hover:text-violet-200"
            >
              Complete certificate profile →
            </Link>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QuickLink to="/student/my-courses" icon="📚" label="My Courses" desc="Continue learning" />
        <QuickLink to="/student/pay" icon="💳" label="Pay for Class" desc="Top up wallet" />
        <QuickLink to="/student/help" icon="💬" label="Help & Support" desc="Ask a question" />
      </div>

      {/* Essential academy details */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Your class details</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <InfoTile icon="📱" label="Mobile login" value={loginId} />
          <InfoTile icon="🪪" label="Student ID" value={studentId} mono />
          <InfoTile icon="👥" label="Batch / timing" value={batchDisplay} />
          <InfoTile icon="🎓" label="Enrolled course(s)" value={enrolledCourses} />
        </div>
      </div>

      {/* Security */}
      <div className="mt-8 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Password & security</h3>
            <p className="mt-0.5 text-sm text-gray-400">Change your login password anytime.</p>
          </div>
          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true)
                setPwdErr('')
                setPwdMsg('')
              }}
              className="rounded-xl border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700"
            >
              Change password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4 border-t border-gray-700 pt-5">
            <div>
              <label htmlFor="cur-pwd" className="block text-sm text-gray-400">
                Current password
              </label>
              <input
                id="cur-pwd"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-600 bg-gray-900 px-3 py-2.5 text-white"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="new-pwd" className="block text-sm text-gray-400">
                  New password
                </label>
                <input
                  id="new-pwd"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-600 bg-gray-900 px-3 py-2.5 text-white"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="conf-pwd" className="block text-sm text-gray-400">
                  Confirm password
                </label>
                <input
                  id="conf-pwd"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-600 bg-gray-900 px-3 py-2.5 text-white"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {pwdErr && <p className="text-sm text-red-400">{pwdErr}</p>}
            {pwdMsg && <p className="text-sm text-emerald-400">{pwdMsg}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={pwdLoading}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {pwdLoading ? 'Updating…' : 'Save new password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setPwdErr('')
                }}
                className="rounded-xl border border-gray-600 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="font-semibold text-white">Sign out</h3>
        <p className="mt-1 text-sm text-gray-400">Log out on this device. You can sign in again anytime.</p>
        <button
          type="button"
          onClick={logout}
          className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
