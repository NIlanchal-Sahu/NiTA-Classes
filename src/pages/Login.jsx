import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { id: 'student', label: 'Student', desc: 'View your courses and progress', icon: '🎓' },
  { id: 'teacher', label: 'Teacher', desc: 'Manage batches, attendance and notes', icon: '👩‍🏫' },
  { id: 'admin', label: 'Admin', desc: 'Manage institute and enrollments', icon: '👤' },
]

const LOGIN_MODE = { password: 'password', otp: 'otp' }

export default function Login() {
  const [role, setRole] = useState('student')
  const [mode, setMode] = useState(LOGIN_MODE.password)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpForDev, setOtpForDev] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithPassword, requestOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const redirectTo = role === 'admin' || role === 'teacher' ? '/admin' : '/student'

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithPassword(role, { email: email.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await requestOtp(email.trim(), role)
      setOtpSent(true)
      setOtp('')
      if (result.otpForDev != null) setOtpForDev(result.otpForDev)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email.trim(), otp)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setOtpSent(false)
    setOtpForDev(null)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-gray-900">Login</h1>
      <p className="mt-1 text-gray-600">Choose your account type and sign in with password or OTP.</p>

      {/* Role selector */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => { setRole(r.id); setError(''); setOtpSent(false) }}
            className={`rounded-xl border-2 p-4 text-left transition ${
              role === r.id
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{r.icon}</span>
            <p className="mt-1 font-semibold">{r.label}</p>
            <p className="mt-0.5 text-xs opacity-90">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Password vs OTP toggle */}
      <div className="mt-6 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => switchMode(LOGIN_MODE.password)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === LOGIN_MODE.password ? 'bg-white text-primary-600 shadow' : 'text-gray-600'}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => switchMode(LOGIN_MODE.otp)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === LOGIN_MODE.otp ? 'bg-white text-primary-600 shadow' : 'text-gray-600'}`}
        >
          OTP
        </button>
      </div>

      {mode === LOGIN_MODE.password ? (
        <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
              {role === 'admin' || role === 'teacher'
                ? `${role[0].toUpperCase()}${role.slice(1)} login`
                : 'Student ID / Mobile / Email'}
            </label>
            <input
              id="login-email"
              type={role === 'admin' ? 'email' : 'text'}
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder={
                role === 'admin'
                  ? 'Enter admin email'
                  : role === 'teacher'
                    ? 'Enter teacher email / username / mobile'
                    : 'e.g. NITA20260321 or 10-digit mobile'
              }
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-touch w-full rounded-xl bg-primary-600 py-4 font-semibold text-white hover:bg-primary-700 disabled:opacity-70 transition"
          >
            {loading ? 'Signing in...' : role === 'admin' ? 'Admin Login' : role === 'teacher' ? 'Teacher Login' : 'Student Login'}
          </button>
        </form>
      ) : (
        <div className="mt-8 space-y-5">
          {!otpSent ? (
            <form onSubmit={handleRequestOtp}>
              <div>
            <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700">
                  {role === 'student' ? 'Student ID / Mobile / Email' : 'Email'}
                </label>
                <input
                  id="otp-email"
                  type={role === 'student' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder={role === 'student' ? 'NITA… or 10-digit mobile' : 'your@email.com'}
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-touch mt-4 w-full rounded-xl bg-primary-600 py-4 font-semibold text-white hover:bg-primary-700 disabled:opacity-70 transition"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              {otpForDev != null && (
                <p className="mb-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
                  Dev only: your OTP is <strong>{otpForDev}</strong>
                </p>
              )}
              <div>
                <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="000000"
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setError('') }}
                  className="btn-touch flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change email
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-touch flex-1 rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-70 transition"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Use your assigned credentials to sign in. Contact admin if you need help.
      </p>
      <p className="mt-2 text-center">
        <Link to="/" className="text-sm font-medium text-primary-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
