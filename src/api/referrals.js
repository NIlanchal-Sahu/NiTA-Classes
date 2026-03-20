function getToken() {
  return localStorage.getItem('nita_token')
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getReferralMe() {
  const res = await fetch('/api/student/referrals/me', { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load referral details')
  return data
}

export async function registerAffiliate(option) {
  const res = await fetch('/api/student/referrals/register', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ option }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to register affiliate partner')
  return data
}

export async function adminOverview() {
  const res = await fetch('/api/student/referrals/admin/overview', { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load referral overview')
  return data
}

export async function adminRunPayouts(month) {
  const res = await fetch('/api/student/referrals/admin/run-payouts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ month }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to run payouts')
  return data
}

