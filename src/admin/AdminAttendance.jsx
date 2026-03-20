import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminAttendance() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [batchId, setBatchId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [status, setStatus] = useState('present')
  const [report, setReport] = useState([])
  const [records, setRecords] = useState([])
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [att, rep, b, s] = await Promise.all([
        academyApi.getAttendance(`date=${date}${batchId ? `&batchId=${encodeURIComponent(batchId)}` : ''}`),
        academyApi.getMonthlyAttendanceReport(month, batchId),
        academyApi.getBatches(),
        academyApi.getStudents(),
      ])
      setRecords(att.attendance || [])
      setReport(rep.report || [])
      setBatches(b.batches || [])
      setStudents(s.students || [])
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, date, batchId])

  const mark = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.markAttendance({ date, batchId, studentId, status })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to mark attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
      <p className="mt-1 text-gray-400">Mark daily attendance, filter by batch/date, and check monthly percentage reports.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}
      {loading && <div className="mt-6 text-gray-400">Loading...</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Mark Daily Attendance</h2>
        <form onSubmit={mark} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <input type="date" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={date} onChange={(e) => setDate(e.target.value)} required />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={batchId} onChange={(e) => setBatchId(e.target.value)} required>
            <option value="">Select batch</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.monthYear})</option>)}
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Mark'}
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Daily Records</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Batch</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-3">{r.date}</td>
                  <td className="px-3 py-3">{r.batchId}</td>
                  <td className="px-3 py-3">{r.studentId}</td>
                  <td className="px-3 py-3">{r.status}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-gray-500">No records for selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Monthly Attendance Report</h2>
          <input value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="YYYY-MM" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Present</th>
                <th className="px-3 py-3">Absent</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {report.map((r) => (
                <tr key={r.studentId}>
                  <td className="px-3 py-3">{r.studentId}</td>
                  <td className="px-3 py-3">{r.present}</td>
                  <td className="px-3 py-3">{r.absent}</td>
                  <td className="px-3 py-3">{r.total}</td>
                  <td className="px-3 py-3">{r.percentage}%</td>
                </tr>
              ))}
              {report.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-gray-500">No monthly data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

