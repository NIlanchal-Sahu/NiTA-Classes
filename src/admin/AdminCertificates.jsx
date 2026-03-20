import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminCertificates() {
  const [students, setStudents] = useState([])
  const [certs, setCerts] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    courseName: '',
    completionDate: new Date().toISOString().slice(0, 10),
  })

  const refresh = async () => {
    setError('')
    try {
      const [s, c] = await Promise.all([academyApi.getStudents(), academyApi.getCertificates()])
      setStudents(s.students || [])
      setCerts(c.certificates || [])
    } catch (e) {
      setError(e.message || 'Failed to load certificates')
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.generateCertificate(form)
      setForm((p) => ({ ...p, studentId: '', studentName: '', courseName: '' }))
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to generate certificate')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Certificate Generation</h1>
      <p className="mt-1 text-gray-400">Generate and export certificate records (PDF URL placeholder in MVP).</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={form.studentId}
            onChange={(e) => {
              const id = e.target.value
              const s = students.find((x) => x.id === id)
              setForm((p) => ({ ...p, studentId: id, studentName: s?.name || '' }))
            }}
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            required
          >
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
          </select>
          <input value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Student name" required />
          <input value={form.courseName} onChange={(e) => setForm((p) => ({ ...p, courseName: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Course name" required />
          <input type="date" value={form.completionDate} onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" required />
          <div className="sm:col-span-2 lg:col-span-4">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Generated Certificates</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Completion</th>
                <th className="px-3 py-3">PDF</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {certs.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-3">{c.studentName}</td>
                  <td className="px-3 py-3">{c.courseName}</td>
                  <td className="px-3 py-3">{c.completionDate}</td>
                  <td className="px-3 py-3"><span className="text-xs text-gray-400">{c.pdfUrl}</span></td>
                </tr>
              ))}
              {certs.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-gray-500">No certificates generated yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

