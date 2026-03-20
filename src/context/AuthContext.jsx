import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const u = await authApi.fetchMe()
    setUser(u)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const loginWithPassword = async (role, { email, password }) => {
    const data = await authApi.loginWithPassword(email, password, role)
    authApi.saveToken(data.token)
    setUser(data.user)
    return { ok: true }
  }

  const requestOtp = async (email, role) => {
    const data = await authApi.requestOtp(email, role)
    return { ok: true, otpForDev: data.otpForDev }
  }

  const verifyOtp = async (email, otp) => {
    const data = await authApi.verifyOtp(email, otp)
    authApi.saveToken(data.token)
    setUser(data.user)
    return { ok: true }
  }

  const logout = () => {
    authApi.clearToken()
    setUser(null)
  }

  const refreshUser = useCallback(async () => {
    const u = await authApi.fetchMe()
    if (u) setUser(u)
  }, [])

  const value = {
    user,
    loading,
    loginWithPassword,
    requestOtp,
    verifyOtp,
    logout,
    refreshUser,
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin',
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
