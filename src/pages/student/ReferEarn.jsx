import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as referralsApi from '../../api/referrals'

function formatOption(opt) {
  if (opt === 'fixed200') return '₹200 per student referred'
  if (opt === 'perClass1') return '₹1 per class attended (monthly)'
  return '—'
}

function defaultMonthKey() {
  // previous month by default (since payouts happen on 1st for last month)
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

export default function ReferEarn() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [choice, setChoice] = useState('fixed200')
  const [filterMonth, setFilterMonth] = useState(defaultMonthKey())

  const myCode = data?.partner?.code || ''
  const myOption = data?.partner?.option || ''
  const isPartner = !!data?.partner?.code
  const filteredPayouts = (data?.recentPayouts || []).filter((p) => !filterMonth || p.month === filterMonth)
  const filteredEarned = filteredPayouts.reduce((a, b) => a + (Number(b.amount) || 0), 0)

  const shareText = useMemo(() => {
    if (!myCode) return ''
    return `Join NITA Classes and use my referral code: ${myCode}`
  }, [myCode])

  const waShare = useMemo(() => {
    if (!shareText) return ''
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`
  }, [shareText])

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt)
    } catch {
      // ignore
    }
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await referralsApi.getReferralMe()
      setData(d)
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegister = async () => {
    setRegistering(true)
    setError('')
    try {
      await referralsApi.registerAffiliate(choice)
      await refreshUser()
      await load()
    } catch (e) {
      setError(e.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refer & Earn</h1>
          <p className="mt-1 text-sm text-gray-600">
            Share your referral code, help others join NITA Classes, and earn rewards.
          </p>
        </div>
        <Link to="/admission" className="btn-touch inline-flex rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700">
          New Admission
        </Link>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">How it works</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { t: '1) Register as Affiliate Partner', d: 'Join free and get your referral code instantly.' },
              { t: '2) Share your Referral Code', d: 'Friends enter your code during Admission or Enrollment.' },
              { t: '3) Student attends classes', d: 'Earnings are based on the option you choose.' },
              { t: '4) Payout on next month 1st', d: 'After a calendar month ends, earnings are added to your wallet on the 1st day of next month.' },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="font-semibold text-gray-900">{x.t}</div>
                <div className="mt-1 text-sm text-gray-600">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50 p-4">
            <div className="text-sm font-semibold text-primary-900">Your current wallet balance</div>
            <div className="mt-1 text-2xl font-extrabold text-primary-900">₹{Number(user?.walletBalance || 0)}</div>
            <div className="mt-2 text-xs text-gray-600">Tip: add wallet balance from “Pay for Class” if needed.</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Your Referral</h2>

          {loading ? (
            <div className="mt-4 text-sm text-gray-600">Loading...</div>
          ) : isPartner ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-600">Referral code</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="text-lg font-extrabold tracking-wider text-gray-900">{myCode}</div>
                  <button type="button" onClick={() => copy(myCode)} className="btn-touch rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50">
                    Copy
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-600">Earning option: {formatOption(myOption)}</div>
              </div>

              <div className="grid gap-2">
                <a href={waShare} target="_blank" rel="noopener noreferrer" className="btn-touch inline-flex items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
                  Share on WhatsApp
                </a>
                <button type="button" onClick={() => copy(shareText)} className="btn-touch rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                  Copy share message
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900">Your stats</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Students referred</div>
                    <div className="text-xl font-extrabold text-gray-900">{data?.totals?.totalReferred ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Total earnings</div>
                    <div className="text-xl font-extrabold text-gray-900">₹{data?.totals?.totalPayouts ?? 0}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Payout happens on the 1st day of next month. For example, March classes → credited on 1st April.
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900">Recent payouts</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800"
                    placeholder="YYYY-MM"
                  />
                  <span className="text-xs text-gray-600">Month earned: ₹{filteredEarned}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {filteredPayouts.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">₹{p.amount}</div>
                        <div className="text-xs text-gray-600">{p.kind === 'fixed200' ? '₹200 referral bonus' : '₹1 per class'} • {p.month}</div>
                      </div>
                      <div className="text-xs text-gray-500">{String(p.createdAt || '').slice(0, 10)}</div>
                    </div>
                  ))}
                  {filteredPayouts.length === 0 && (
                    <div className="text-sm text-gray-600">No payouts yet.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
                <div className="font-semibold">Register as Affiliate Partner</div>
                <div className="mt-1 text-sm">
                  Registration fee is <span className="font-semibold">₹0</span>. You’ll get your referral code immediately.
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Choose your benefit option</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
                    <input type="radio" name="choice" className="mt-1" checked={choice === 'fixed200'} onChange={() => setChoice('fixed200')} />
                    <div>
                      <div className="font-semibold text-gray-900">Option 1: ₹200 for each student referred</div>
                      <div className="text-sm text-gray-600">Paid once after the referred student attends at least 1 class.</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
                    <input type="radio" name="choice" className="mt-1" checked={choice === 'perClass1'} onChange={() => setChoice('perClass1')} />
                    <div>
                      <div className="font-semibold text-gray-900">Option 2: ₹1 per class attended</div>
                      <div className="text-sm text-gray-600">Monthly earnings are credited on the 1st day of next month.</div>
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={registering}
                  className="btn-touch w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {registering ? 'Registering...' : 'Join Free and Get Referral Code'}
                </button>

                <div className="text-xs text-gray-600">
                  No joining fee required. Register and start sharing your code.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

