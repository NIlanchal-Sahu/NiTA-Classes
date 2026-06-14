import { useEffect, useMemo, useState } from 'react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { academyApi } from '../api/adminAcademy'
import { summarizeCourse } from '../lib/courseContentUtils'
import { useAuth } from '../context/AuthContext'

export default function AdminCourses() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const [courses, setCourses] = useState([])
  const [contentCourses, setContentCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: '',
    status: 'active',
    priceType: 'perClass10',
    price: 10,
  })
  const [saving, setSaving] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [out, content] = await Promise.all([academyApi.getCourses(), academyApi.getContentCourses()])
      setCourses(out.courses || [])
      setContentCourses(content.courses || [])
    } catch (e) {
      setError(e.message || 'Failed to load courses')
    } finally {
      setLoading(false)
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
      if (editingCourseId) {
        await academyApi.updateCourse(editingCourseId, form)
        setEditingCourseId('')
      } else {
        await academyApi.createCourse(form)
      }
      setForm({
        name: '',
        description: '',
        duration: '',
        status: 'active',
        priceType: 'perClass10',
        price: 10,
      })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const contentMap = useMemo(() => {
    const map = new Map()
    for (const c of contentCourses) map.set(String(c.id), c)
    return map
  }, [contentCourses])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Course Management</h1>
      <p className="mt-1 text-gray-400">
        {isTeacher
          ? 'View assigned courses and open Content & Quizzes to edit study notes and practice MCQs.'
          : 'Manage course pricing and metadata here. Use Content & Quizzes to edit study notes, practice MCQs, and videos.'}
        {!isTeacher && (
          <>
            {' '}
            <Link to="/admin/content" className="text-violet-300 hover:underline">
              Open Content & Quizzes →
            </Link>
          </>
        )}
      </p>
      {successMsg && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{successMsg}</div>
      )}
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      {!isTeacher && (
      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">{editingCourseId ? 'Edit Course' : 'Create Course'}</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Course name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Duration (e.g. 3 Months)" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
          <textarea className="sm:col-span-2 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.priceType} onChange={(e) => setForm((p) => ({ ...p, priceType: e.target.value }))}>
            <option value="perClass10">₹10 per class</option>
            <option value="custom">Custom</option>
          </select>
          <input type="number" min="0" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) || 0 }))} />
          <div className="sm:col-span-2">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingCourseId ? 'Update Course' : 'Create Course'}
            </button>
            {editingCourseId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingCourseId('')
                  setForm({
                    name: '',
                    description: '',
                    duration: '',
                    status: 'active',
                    priceType: 'perClass10',
                    price: 10,
                  })
                }}
                className="ml-3 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
      )}

      <div className="mt-6 flex max-h-[min(85vh,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
        <div className="shrink-0 border-b border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Courses</h2>
          <p className="mt-1 text-xs text-gray-500">Scroll inside this panel — sidebar stays fixed.</p>
        </div>
        {loading ? (
          <div className="p-6 text-gray-400">Loading...</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-4 pb-4 pt-2 lg:px-6">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Price Type</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {courses.map((c) => (
                  <Fragment key={c.id}>
                    <tr>
                      <td className="px-3 py-3">{c.name}</td>
                      <td className="px-3 py-3">{c.duration || '—'}</td>
                      <td className="px-3 py-3">{c.status || 'active'}</td>
                      <td className="px-3 py-3">{c.priceType}</td>
                      <td className="px-3 py-3">₹{c.price}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {!isTeacher && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourseId(c.id)
                              setForm({
                                name: c.name || '',
                                description: c.description || '',
                                duration: c.duration || '',
                                status: c.status || 'active',
                                priceType: c.priceType || 'perClass10',
                                price: Number(c.price) || 0,
                              })
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="rounded border border-sky-500/50 px-2 py-1 text-xs text-sky-200 hover:bg-sky-500/10"
                          >
                            Edit
                          </button>
                          )}
                          <Link
                            to={`/admin/content?course=${encodeURIComponent(c.id)}`}
                            className="rounded border border-violet-500/50 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/10"
                          >
                            Content & Quizzes
                          </Link>
                          <button
                            type="button"
                            onClick={() => setExpandedCourseId((prev) => (prev === c.id ? '' : c.id))}
                            className="rounded border border-gray-500/50 px-2 py-1 text-xs text-gray-300 hover:bg-gray-500/10"
                          >
                            {expandedCourseId === c.id ? 'Hide summary' : 'Summary'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCourseId === c.id ? (
                      <tr key={`${c.id}-content`}>
                        <td className="px-3 py-4 bg-gray-900/60" colSpan={6}>
                          {(() => {
                            const content = contentMap.get(String(c.id))
                            const stats = content ? summarizeCourse(content) : null
                            return (
                              <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <h3 className="text-sm font-semibold text-white">Content overview</h3>
                                    {stats ? (
                                      <p className="mt-1 text-xs text-gray-400">
                                        {stats.modules} modules · {stats.chapters} chapters · {stats.notes} study notes ·{' '}
                                        {stats.quizzes} practice quizzes · {stats.mcqs} MCQs
                                      </p>
                                    ) : (
                                      <p className="mt-1 text-xs text-gray-500">No LMS content synced for this course yet.</p>
                                    )}
                                  </div>
                                  <Link
                                    to={`/admin/content?course=${encodeURIComponent(c.id)}`}
                                    className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                                  >
                                    Open Content & Quiz Studio →
                                  </Link>
                                </div>
                                {content?.modules?.length ? (
                                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {[...(content.modules || [])]
                                      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
                                      .slice(0, 6)
                                      .map((m) => (
                                        <li key={m.id} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300">
                                          <span className="font-medium text-white">{m.order}. {m.title}</span>
                                          <span className="mt-0.5 block text-gray-500">{(m.chapters || []).length} chapters</span>
                                        </li>
                                      ))}
                                    {(content.modules || []).length > 6 && (
                                      <li className="rounded-lg border border-dashed border-gray-600 px-3 py-2 text-xs text-gray-500">
                                        +{(content.modules || []).length - 6} more modules — open studio to edit
                                      </li>
                                    )}
                                  </ul>
                                ) : null}
                              </div>
                            )
                          })()}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
                {courses.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-gray-500">No courses found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

