import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminPanel() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-gray-600">Signed in as {user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="btn-touch shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Enrollments</h2>
          <p className="mt-2 text-gray-600">View and manage admission form submissions. (Connect to Google Sheet or DB.)</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <p className="mt-2 text-gray-600">Manage student accounts and course assignments. (Future.)</p>
        </div>
      </div>
      <div className="mt-6">
        <Link to="/" className="text-sm font-medium text-primary-600 hover:underline">← Back to site</Link>
      </div>
    </div>
  )
}
