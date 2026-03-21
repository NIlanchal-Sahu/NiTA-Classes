const API_BASE = '/api/auth'

function getToken() {
  return localStorage.getItem('nita_token')
}

function getAuthHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function loginWithPassword(email, password, role) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password, role }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

export async function requestOtp(email, role) {
  const res = await fetch(`${API_BASE}/otp/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, role }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
  return data
}

export async function verifyOtp(email, otp) {
  const res = await fetch(`${API_BASE}/otp/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, otp }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Invalid OTP')
  return data
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/password/change`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to change password')
  return data
}

export async function fetchMe() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/me`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => ({}))
  return data.user || null
}

export function saveToken(token) {
  localStorage.setItem('nita_token', token)
}

export function clearToken() {
  localStorage.removeItem('nita_token')
}
