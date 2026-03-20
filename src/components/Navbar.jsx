import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LOGO_SRC } from '../config'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/admission', label: 'Admission' },
  { to: '/referral', label: 'Referral' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isStudent, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={LOGO_SRC} alt="NITA Academy logo" className="h-10 w-auto sm:h-12" />
          <span className="hidden text-xl font-bold text-primary-600 sm:inline">NITA Classes</span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="btn-touch rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
              >
                {label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li>
                {isAdmin ? (
                  <Link to="/admin" className="btn-touch rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">
                    Admin
                  </Link>
                ) : (
                  <Link to="/student" className="btn-touch rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">
                    Dashboard
                  </Link>
                )}
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-touch rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/login"
                className="btn-touch rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          className="btn-touch md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3">
          <ul className="flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="btn-touch block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-primary-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <Link
                    to={isAdmin ? '/admin' : '/student'}
                    className="btn-touch block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-primary-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {isAdmin ? 'Admin' : 'Dashboard'}
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-touch w-full rounded-lg px-4 py-3 text-base font-medium text-left text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="btn-touch block rounded-lg bg-primary-600 px-4 py-3 text-base font-medium text-white text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
