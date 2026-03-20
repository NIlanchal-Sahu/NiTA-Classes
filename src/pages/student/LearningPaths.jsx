import { useEffect, useMemo, useState } from 'react'
import { studentPortalApi } from '../../api/student'

function monthDays(month) {
  const [y, m] = String(month).split('-').map(Number)
  const total = new Date(y, m, 0).getDate()
  return Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

export default function LearningPaths() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [courseId, setCourseId] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const out = await studentPortalApi.getAttendance(month, courseId)
        setData(out)
      } catch {
        setData({ attendance: [], monthlyPercentage: 0, month })
      }
    })()
  }, [month, courseId])

  const dailyStatus = useMemo(() => {
    const map = {}
    for (const r of data?.attendance || []) map[r.date] = r.status
    return map
  }, [data])

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Attendance Tracker</h1>
      <p className="mt-1 text-gray-400">Daily attendance list, monthly %, and course-wise filter.</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <input value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="YYYY-MM" />
        <input value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Course ID (optional)" />
        <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300">
          Monthly Attendance: <span className="font-semibold text-white">{data?.monthlyPercentage ?? 0}%</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="font-semibold text-white">Calendar View</h3>
        <p className="mt-1 text-xs text-gray-400">Green = Present, Red = Absent, Gray = Not marked</p>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {monthDays(month).map((d) => {
            const s = dailyStatus[d]
            const color = s === 'present' ? 'bg-emerald-600/30 border-emerald-500' : s === 'absent' ? 'bg-red-600/30 border-red-500' : 'bg-gray-900 border-gray-700'
            return (
              <div key={d} className={`rounded border p-2 text-center text-xs ${color}`}>
                <div className="text-gray-300">{d.slice(-2)}</div>
                <div className="mt-1 text-[10px] text-white">{s || '—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="font-semibold text-white">Daily Attendance List</h3>
        <div className="mt-3 space-y-2">
          {(data?.attendance || []).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm">
              <span className="text-gray-300">{r.date}</span>
              <span className={r.status === 'present' ? 'text-emerald-300' : 'text-red-300'}>{r.status}</span>
            </div>
          ))}
          {(data?.attendance || []).length === 0 && <p className="text-sm text-gray-500">No attendance records for selected filters.</p>}
        </div>
      </div>
    </>
  )
}
