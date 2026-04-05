import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import { studentPortalApi } from '../../api/student'
import * as authApi from '../../api/auth'

export default function Settings() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [coursesLearning, setCoursesLearning] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [out, learn] = await Promise.all([
          studentPortalApi.getProfile(),
          studentPortalApi.getCoursesLearning().catch(() => null),
        ])
        setProfile(out)
        setCoursesLearning(learn)
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
    return profile?.student?.batchId || '—'
  }, [coursesLearning, profile])

  const courseDisplay = useMemo(() => {
    const code = profile?.student?.courseEnrolled
    if (!code) return '—'
    const all = coursesLearning?.allCourses || []
    const found = all.find((c) => String(c.id).toLowerCase() === String(code).toLowerCase())
    return found?.name || code
  }, [coursesLearning, profile])

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
    } catch (err) {
      setPwdErr(err.message || 'Failed to update password')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-gray-400">Manage your account and preferences.</p>

      {profile && profile.isLinked === false && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="font-semibold text-amber-900">Link Student ID</div>
          <div className="mt-1 text-sm text-amber-900/90">Required to show attendance, fees, notes and certificates correctly.</div>
          <button
            type="button"
            onClick={() => window.location.assign('/student/link-student')}
            className="mt-4 btn-touch rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Link now
          </button>
        </div>
      )}

      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-6">
          <h3 className="font-semibold text-white">Certification profile</h3>
          <p className="mt-1 text-sm text-gray-400">
            Full name, Aadhaar, address, qualification, and document uploads for certificates and records.
          </p>
          <Link
            to="/student/profile"
            className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Edit profile
          </Link>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="font-semibold text-white">Academy account</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Login (mobile / email)</dt>
              <dd className="text-white">{user?.email || '—'}</dd>
            </div>
            {user?.studentId && (
              <div>
                <dt className="text-gray-500">Student ID</dt>
                <dd className="font-mono text-white">{user.studentId}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="text-white">{user?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Student ID (academy)</dt>
              <dd className="text-white">{profile?.student?.id || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-white">{profile?.student?.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Class / Batch</dt>
              <dd className="text-white">{batchDisplay}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Course</dt>
              <dd className="text-white">{courseDisplay}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Admission Date</dt>
              <dd className="text-white">{profile?.student?.admissionDate || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="font-semibold text-white">Change password</h3>
          <p className="mt-1 text-sm text-gray-400">
            Enter your current password, then choose a new one. Use this after your first login with the enrollment password.
          </p>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4 max-w-md">
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
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                required
              />
            </div>
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
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="conf-pwd" className="block text-sm text-gray-400">
                Confirm new password
              </label>
              <input
                id="conf-pwd"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                required
                minLength={6}
              />
            </div>
            {pwdErr && <p className="text-sm text-red-400">{pwdErr}</p>}
            {pwdMsg && <p className="text-sm text-green-400">{pwdMsg}</p>}
            <button
              type="submit"
              disabled={pwdLoading}
              className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {pwdLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="font-semibold text-white">Sign out</h3>
          <p className="mt-1 text-sm text-gray-400">Sign out of your account on this device.</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
