import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminStudentProfiles() {
  const [profiles, setProfiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const out = await academyApi.getStudentProfiles()
      setProfiles(out.profiles || [])
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Student certification profiles</h1>
      <p className="mt-1 text-gray-400">Structured data submitted by students (read-only). Syncs to Google Sheets when server is configured.</p>
      {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{error}</div>}
      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-700 bg-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-700 text-gray-400">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Mobile</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Aadhaar</th>
                <th className="px-3 py-3">Qualification</th>
                <th className="px-3 py-3">Updated</th>
                <th className="px-3 py-3">Auth ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {profiles.map((p) => (
                <tr key={p.authUserId}>
                  <td className="px-3 py-2 font-medium text-white">{p.fullName || '—'}</td>
                  <td className="px-3 py-2">{p.mobile || '—'}</td>
                  <td className="px-3 py-2">{p.email || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.aadhaarNumber ? `XXXX${String(p.aadhaarNumber).slice(-4)}` : '—'}</td>
                  <td className="px-3 py-2">{p.highestQualification || '—'}</td>
                  <td className="px-3 py-2 text-xs">{p.updatedAt ? String(p.updatedAt).slice(0, 10) : '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.authUserId}</td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No profiles submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
