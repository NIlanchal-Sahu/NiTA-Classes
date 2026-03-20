const API_BASE = '/api/student'

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

export async function getStudentProfile() {
  const res = await fetch(`${API_BASE}/profile`, { headers: getAuthHeaders() })
  if (!res.ok) return null
  const data = await res.json().catch(() => ({}))
  return data
}

export async function scanToPay(courseId, options = {}) {
  const { date, confirmMultiple } = options
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ courseId, date, confirmMultiple: !!confirmMultiple }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Payment failed')
  return data
}

export async function addWallet(amount) {
  const res = await fetch(`${API_BASE}/wallet/add`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to add balance')
  return data
}

export async function purchaseUnlimitedPromo() {
  const res = await fetch(`${API_BASE}/promo/unlimited-month`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Purchase failed')
  return data
}

async function portalGet(path) {
  const res = await fetch(`${API_BASE}/portal/${path}`, { headers: getAuthHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load portal data')
  return data
}

async function portalPost(path, body) {
  const res = await fetch(`${API_BASE}/portal/${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body || {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const studentPortalApi = {
  getProfile: () => portalGet('profile'),
  getClaimOptions: () => portalGet('claim-options'),
  claimStudent: (studentId) => portalPost('claim', { studentId }),
  getAttendance: (month, courseId = '') =>
    portalGet(`attendance?month=${encodeURIComponent(month || '')}${courseId ? `&courseId=${encodeURIComponent(courseId)}` : ''}`),
  getFees: () => portalGet('fees'),
  createPaymentRequest: (body) => portalPost('payment-requests', body),
  getCoursesLearning: () => portalGet('courses'),
  getMaterials: (courseId = '', batchId = '') =>
    portalGet(`materials${courseId || batchId ? `?${courseId ? `courseId=${encodeURIComponent(courseId)}` : ''}${courseId && batchId ? '&' : ''}${batchId ? `batchId=${encodeURIComponent(batchId)}` : ''}` : ''}`),
  getReferrals: (month) => portalGet(`referrals?month=${encodeURIComponent(month || '')}`),
  getCertificates: () => portalGet('certificates'),
  requestCertificate: (body) => portalPost('certificates/request', body),
  getMiniDashboard: () => portalGet('dashboard'),
}
