import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LOGO_SRC } from '../config'

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase()

  const isTeacher = user?.role === 'teacher'
  const items = isTeacher
    ? [
        { to: '/admin', end: true, label: 'Dashboard' },
        { to: '/admin/students', label: 'Students' },
        { to: '/admin/courses', label: 'Courses' },
        { to: '/admin/batches', label: 'Batches' },
        { to: '/admin/attendance', label: 'Attendance' },
        { to: '/admin/notes', label: 'Course Content' },
      ]
    : [
        { to: '/admin', end: true, label: 'Dashboard' },
        { to: '/admin/students', label: 'Students' },
        { to: '/admin/courses', label: 'Courses' },
        { to: '/admin/batches', label: 'Batches' },
        { to: '/admin/attendance', label: 'Attendance' },
        { to: '/admin/fees', label: 'Fees & Payments' },
        { to: '/admin/discounts', label: 'Discounts' },
        { to: '/admin/referrals', label: 'Referrals' },
        { to: '/admin/notes', label: 'Course Content' },
        { to: '/admin/certificates', label: 'Certificates' },
        { to: '/admin/enrollments', label: 'Admissions Queue' },
        { to: '/admin/notifications', label: 'Notifications' },
      ]

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-gray-900">
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        style={{ display: open ? 'block' : 'none' }}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-700 bg-gray-800 lg:static lg:translate-x-0 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-700 px-4">
          <Link
            to="/admin"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <img src={LOGO_SRC} alt="NITA Academy logo" className="h-9 w-auto" />
            <span className="text-lg font-bold text-violet-300">{user?.role === 'teacher' ? 'Teacher' : 'Admin'}</span>
          </Link>
          <button
            type="button"
            className="btn-touch rounded-lg p-2 text-gray-400 hover:bg-gray-700 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 lg:px-8">
          <button
            type="button"
            className="btn-touch -ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-800 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-touch rounded-lg p-2 text-gray-400 hover:bg-gray-800"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-semibold text-white">
                {initial}
              </div>
              <span className="hidden text-sm font-medium text-white sm:block">
                {user?.name || user?.email || 'Admin'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="btn-touch hidden sm:inline-flex rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

