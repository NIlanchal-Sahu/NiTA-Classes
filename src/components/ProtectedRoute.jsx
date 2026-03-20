import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protects routes that require a specific role (student or admin).
 * Redirects to /login if not logged in, or to the correct dashboard if wrong role.
 */
export default function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const allowedRoles = Array.isArray(requireRole) ? requireRole : requireRole ? [requireRole] : []
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectTo = user.role === 'admin' || user.role === 'teacher' ? '/admin' : '/student'
    return <Navigate to={redirectTo} replace />
  }

  return children
}
