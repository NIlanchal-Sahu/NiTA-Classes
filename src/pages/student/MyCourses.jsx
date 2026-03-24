import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { studentPortalApi } from '../../api/student'

export default function MyCourses() {
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [student, setStudent] = useState(null)
  const [assignedBatch, setAssignedBatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const courseNames = courses.map((c) => c.name).filter(Boolean)
  const primaryBatchName = assignedBatch?.name || assignedBatch?.title || student?.batchId || '—'

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const out = await studentPortalApi.getCoursesLearning()
        setCourses(out.enrolledCourses || [])
        setBatches(out.upcomingBatches || [])
        setStudent(out.student || null)
        setAssignedBatch(out.assignedBatch || null)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <>
      <h1 className="text-2xl font-bold text-white">My Courses</h1>
      <p className="mt-1 text-gray-400">Enrolled course details, duration, and upcoming batches.</p>

      <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
        Course Name: <span className="text-white">{courseNames.join(', ') || '—'}</span> · Batch Name:{' '}
        <span className="text-white">{primaryBatchName}</span>
        {assignedBatch && (
          <div className="mt-2 text-gray-400">
            Timing: <span className="text-white">{assignedBatch.timing || '—'}</span> · Teacher:{' '}
            <span className="text-white">
              {(assignedBatch.teacherIds || [assignedBatch.teacherId]).filter(Boolean).join(', ') || '—'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
            <div className="aspect-video bg-gray-700">
              <img src="/qr-dummy.png" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white">{c.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{c.duration || 'Duration as per plan'}</p>
              <p className="mt-1 text-sm text-gray-400 line-clamp-2">{c.description || 'Course details available in academy dashboard.'}</p>
              <div className="mt-3 h-2 rounded-full bg-gray-700">
                <div className="h-full rounded-full bg-violet-600" style={{ width: '35%' }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">Progress tracking enabled</p>
              <Link
                to={`/student/course/${c.id}`}
                className="mt-3 inline-block text-sm font-medium text-violet-400 hover:text-violet-300"
              >
                Open Course →
              </Link>
            </div>
          </div>
        ))}
        {!loading && courses.length === 0 && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-400">
            No enrolled courses found yet.
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-6">
        <h3 className="font-semibold text-white">Upcoming Batches</h3>
        <div className="mt-3 space-y-2">
          {batches.map((b) => (
            <div key={b.id} className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300">
              {b.name} ({b.monthYear || b.startDate || '—'}) · {b.timing} · Teacher:{' '}
              {(b.teacherIds || [b.teacherId]).filter(Boolean).join(', ') || '—'}
            </div>
          ))}
          {!loading && batches.length === 0 && <p className="text-sm text-gray-500">No upcoming batches mapped yet.</p>}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">
        <p className="text-gray-400">Want more? Explore new courses.</p>
        <Link to="/student/explore" className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          Explore Courses
        </Link>
      </div>
    </>
  )
}
