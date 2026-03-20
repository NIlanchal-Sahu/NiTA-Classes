import { useEffect, useState } from 'react'
import { studentPortalApi } from '../../api/student'

export default function Achievements() {
  const [mini, setMini] = useState(null)
  const [certs, setCerts] = useState([])
  const [certReqs, setCertReqs] = useState([])
  const [courseName, setCourseName] = useState('')
  useEffect(() => {
    ;(async () => {
      try {
        const [out, c] = await Promise.all([studentPortalApi.getMiniDashboard(), studentPortalApi.getCertificates()])
        setMini(out)
        setCerts(c.certificates || [])
        setCertReqs(c.requests || [])
      } catch {
        // ignore
      }
    })()
  }, [])
  return (
    <>
      <h1 className="text-2xl font-bold text-white">Achievements</h1>
      <p className="mt-1 text-gray-400">Attendance %, achievements, course progress and referral rewards.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Attendance %</p>
          <p className="text-xl font-bold text-white">{mini?.attendancePercentage ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Course Progress</p>
          <p className="text-xl font-bold text-white">{mini?.courseProgress ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Rewards</p>
          <p className="text-xl font-bold text-white">₹{mini?.rewards ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Earned by Referring</p>
          <p className="text-xl font-bold text-white">₹{mini?.earnedByReferring ?? 0}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(mini?.achievements || ['7 Day Streak', 'First Lesson', 'Course Complete']).map((a) => (
        <div key={a} className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center opacity-70">
          <span className="text-4xl">🔥</span>
          <p className="mt-2 font-medium text-white">{a}</p>
          <p className="text-sm text-gray-400">Earned</p>
        </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-5">
        <h3 className="font-semibold text-white">Certificates</h3>
        <p className="mt-1 text-sm text-gray-400">Request certificate generation and download once generated.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Completed course name"
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={async () => {
              if (!courseName.trim()) return
              await studentPortalApi.requestCertificate({ courseName: courseName.trim() })
              const c = await studentPortalApi.getCertificates()
              setCerts(c.certificates || [])
              setCertReqs(c.requests || [])
              setCourseName('')
            }}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Request Certificate
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-300">Completed / Generated</h4>
            <div className="mt-2 space-y-2">
              {certs.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm">
                  <div className="text-white">{c.courseName}</div>
                  <div className="text-xs text-gray-400">Completed: {c.completionDate}</div>
                  <a href={c.pdfUrl} className="mt-1 inline-block text-xs text-violet-300 hover:underline">
                    Download PDF
                  </a>
                </div>
              ))}
              {certs.length === 0 && <p className="text-sm text-gray-500">No generated certificates yet.</p>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300">Requests</h4>
            <div className="mt-2 space-y-2">
              {certReqs.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm">
                  <div className="text-white">{r.courseName}</div>
                  <div className="text-xs text-gray-400">Status: {r.status}</div>
                </div>
              ))}
              {certReqs.length === 0 && <p className="text-sm text-gray-500">No requests submitted.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
