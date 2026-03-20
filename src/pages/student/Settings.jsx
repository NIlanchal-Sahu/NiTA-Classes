import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import { studentPortalApi } from '../../api/student'

export default function Settings() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const out = await studentPortalApi.getProfile()
        setProfile(out)
      } catch {
        // ignore
      }
    })()
  }, [])

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
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="font-semibold text-white">Profile</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Email / Login</dt>
              <dd className="text-white">{user?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="text-white">{user?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Student ID</dt>
              <dd className="text-white">{profile?.student?.id || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-white">{profile?.student?.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Class / Batch</dt>
              <dd className="text-white">{profile?.student?.batchId || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Course</dt>
              <dd className="text-white">{profile?.student?.courseEnrolled || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Admission Date</dt>
              <dd className="text-white">{profile?.student?.admissionDate || '—'}</dd>
            </div>
          </dl>
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
