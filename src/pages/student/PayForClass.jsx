import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as studentApi from '../../api/student'
import {
  WALLET_PAYEE_NAME,
  WALLET_UPI_ID_PHONEPE,
  WALLET_UPI_ID_AMAZONPAY,
  WALLET_UPI_ID_PAYTM,
} from '../../config'

const COURSE_IDS = [
  { id: 'dca', name: 'DCA (Basic Computer Course)' },
  { id: 'cca', name: 'CCA (Computer Application)' },
  { id: 'spoken-english-mastery', name: 'Spoken English Mastery' },
  { id: 'ai-associate', name: 'AI Associate (Python)' },
  { id: 'ai-video-creation', name: 'AI Video Creation Course' },
]

export default function PayForClass() {
  const [searchParams] = useSearchParams()
  const { user, refreshUser } = useAuth()

  const [courseInput, setCourseInput] = useState('')
  useEffect(() => {
    const fromQr = searchParams.get('course') || searchParams.get('c')
    if (fromQr) setCourseInput(fromQr.trim())
  }, [searchParams])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { courseId, classesCount }

  const walletBalance = user?.walletBalance ?? 0
  const totalClasses = user?.totalClassesAttended ?? 0
  const vvipValidUntil = user?.vvipValidUntil || null
  const isVvip =
    vvipValidUntil &&
    String(vvipValidUntil).slice(0, 10) >= new Date().toISOString().slice(0, 10)

  const [promoLoading, setPromoLoading] = useState(false)
  const [promoSuccess, setPromoSuccess] = useState(null)
  const [feesData, setFeesData] = useState(null)
  const [requestAmount, setRequestAmount] = useState('')
  const [requestPlatform, setRequestPlatform] = useState('phonepe')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestNote, setRequestNote] = useState('')
  const [screenshotDataUrl, setScreenshotDataUrl] = useState('')
  const [screenshotName, setScreenshotName] = useState('')

  const upiId =
    requestPlatform === 'phonepe'
      ? WALLET_UPI_ID_PHONEPE
      : requestPlatform === 'amazonpay'
        ? WALLET_UPI_ID_AMAZONPAY
        : WALLET_UPI_ID_PAYTM

  const upiAmount = Number(requestAmount) || 0
  const upiPurpose = `Wallet Recharge - ${WALLET_PAYEE_NAME}`
  const upiLink = upiAmount
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        WALLET_PAYEE_NAME,
      )}&am=${encodeURIComponent(String(upiAmount))}&cu=INR&tn=${encodeURIComponent(upiPurpose)}`
    : ''

  useEffect(() => {
    ;(async () => {
      try {
        const out = await studentApi.studentPortalApi.getFees()
        setFeesData(out)
      } catch {
        // ignore
      }
    })()
  }, [walletBalance])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    const courseId = courseInput.trim().toLowerCase() || null
    if (!courseId) {
      setError('Enter the course code from the QR code.')
      return
    }

    setLoading(true)
    try {
      const data = await studentApi.scanToPay(courseId)
      if (data.alreadyPaid) {
        setConfirmModal({ courseId, classesCount: data.classesCount })
      } else if (data.success) {
        setSuccess(data)
        await refreshUser()
        setCourseInput('')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmExtra = async () => {
    if (!confirmModal) return
    setError('')
    setLoading(true)
    try {
      const data = await studentApi.scanToPay(confirmModal.courseId, { confirmMultiple: true })
      setSuccess(data)
      setConfirmModal(null)
      await refreshUser()
      setCourseInput('')
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Pay for Class</h1>
      <p className="mt-1 text-gray-400">Scan the class QR code, then enter the course code below. ₹10 per class.</p>

      <div className="mt-6 flex flex-wrap gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <div>
          <p className="text-sm text-gray-400">Wallet balance</p>
          <p className="text-xl font-bold text-white">₹{walletBalance}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Classes attended (total)</p>
          <p className="text-xl font-bold text-white">{totalClasses}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <div>
          <label htmlFor="course-code" className="block text-sm font-medium text-gray-300">
            Course code (from QR)
          </label>
          <input
            id="course-code"
            type="text"
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            placeholder="e.g. dca, cca, ai-associate"
            className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            list="course-list"
          />
          <datalist id="course-list">
            {COURSE_IDS.map((c) => (
              <option key={c.id} value={c.id} />
            ))}
          </datalist>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {success && (
          <div className="rounded-lg bg-emerald-500/20 p-4 text-emerald-300">
            <p className="font-medium">{success.message}</p>
            <p className="mt-1 text-sm">
              Balance: ₹{success.walletBalance} · Total classes: {success.totalClassesAttended}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!isVvip && walletBalance < 10)}
          className="btn-touch rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600"
        >
          {loading ? 'Processing...' : isVvip ? 'Submit (VVIP – no charge)' : 'Submit & Pay ₹10'}
        </button>
      </form>

      {/* Wallet Recharge (Admin approval) */}
      <div className="mt-6 rounded-xl border border-blue-700/40 bg-blue-900/10 p-5">
        <h3 className="font-medium text-white">Wallet Recharge (Pay via PhonePe / AmazonPay / Paytm)</h3>
        <p className="mt-1 text-sm text-gray-300">
          1) Pay the amount using UPI. 2) Upload payment screenshot. 3) Submit request. After admin approval, wallet will be credited.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-gray-200">Amount</label>
            <input
              type="number"
              min="1"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder="Amount"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-200">Platform</label>
            <select
              value={requestPlatform}
              onChange={(e) => setRequestPlatform(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white"
            >
              <option value="phonepe">PhonePe</option>
              <option value="amazonpay">Amazon Pay</option>
              <option value="paytm">Paytm</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-900/20 px-3 py-3">
              <div>
                <div className="text-xs font-semibold text-gray-200">UPI ID (for selected platform)</div>
                <div className="mt-1 font-mono text-sm font-bold text-white">{upiId}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {upiLink ? (
                  <a href={upiLink} className="btn-touch rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-primary-50">
                    Pay Now
                  </a>
                ) : (
                  <span className="text-xs text-gray-300">Enter amount to generate link</span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-200">Payment Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setScreenshotName(file.name)
                const reader = new FileReader()
                reader.onload = () => {
                  setScreenshotDataUrl(String(reader.result || ''))
                }
                reader.readAsDataURL(file)
              }}
              className="mt-1 w-full text-sm text-gray-200"
            />
            {screenshotName ? <div className="mt-1 text-xs text-gray-200">{screenshotName}</div> : null}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-200">UPI Txn ID / Note (optional)</label>
            <input
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="e.g. 1234567890"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white placeholder-gray-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="button"
              disabled={requestLoading || Number(requestAmount) < 1 || !screenshotDataUrl}
              onClick={async () => {
                setRequestLoading(true)
                setError('')
                try {
                  await studentApi.studentPortalApi.createPaymentRequest({
                    amount: Number(requestAmount),
                    platform: requestPlatform,
                    screenshot: screenshotDataUrl,
                    note: requestNote,
                    mode: 'upi',
                  })
                  setRequestAmount('')
                  setRequestNote('')
                  setScreenshotDataUrl('')
                  setScreenshotName('')
                  await refreshUser()
                  const out = await studentApi.studentPortalApi.getFees()
                  setFeesData(out)
                } catch (err) {
                  setError(err.message || 'Failed to submit request')
                } finally {
                  setRequestLoading(false)
                }
              }}
              className="btn-touch w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {requestLoading ? 'Submitting…' : 'Submit payment request (Admin approval)'}
            </button>
            <div className="mt-2 text-xs text-gray-300">
              Wallet will be credited only after admin approves your request.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-5">
        <h3 className="font-medium text-white">Fees Dashboard</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <p className="text-xs text-gray-400">Total Paid Fees</p>
            <p className="text-lg font-bold text-white">₹{feesData?.totalPaid ?? 0}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <p className="text-xs text-gray-400">Wallet Balance</p>
            <p className="text-lg font-bold text-white">₹{feesData?.walletBalance ?? walletBalance}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <p className="text-xs text-gray-400">Payment Requests</p>
            <p className="text-lg font-bold text-white">{feesData?.paymentRequests?.length ?? 0}</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {(feesData?.payments || []).slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">{p.date}</td>
                  <td className="px-3 py-2">₹{p.amount}</td>
                  <td className="px-3 py-2">{p.mode}</td>
                </tr>
              ))}
              {(feesData?.payments || []).length === 0 && (
                <tr><td colSpan={3} className="px-3 py-3 text-gray-500">No payment history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo */}
      <div className="mt-6 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-5">
        <h3 className="font-semibold text-white">Unlimited Classes for one month at ₹699 only</h3>
        <p className="mt-1 text-sm text-gray-300">
          Pay once from wallet. Become a <strong className="text-amber-400">VVIP Student</strong> and attend any
          classes without paying ₹10 class fee until the same date next month.
        </p>

        {promoSuccess && <p className="mt-3 text-sm text-emerald-400">{promoSuccess}</p>}

        {isVvip ? (
          <p className="mt-3 text-sm text-amber-300">You are VVIP until {String(vvipValidUntil).slice(0, 10)}.</p>
        ) : (
          <button
            type="button"
            disabled={promoLoading || walletBalance < 699}
            onClick={async () => {
              setError('')
              setPromoSuccess(null)
              setPromoLoading(true)
              try {
                const data = await studentApi.purchaseUnlimitedPromo()
                setPromoSuccess(data.message || 'You are now a VVIP Student!')
                await refreshUser()
              } catch (err) {
                setError(err.message || 'Purchase failed')
              } finally {
                setPromoLoading(false)
              }
            }}
            className="mt-3 btn-touch rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {promoLoading ? 'Processing…' : 'Buy now – ₹699'}
          </button>
        )}
      </div>

      {/* Valid codes */}
      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="font-medium text-white">Valid course codes</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-400">
          {COURSE_IDS.map((c) => (
            <li key={c.id}>
              <code className="text-violet-300">{c.id}</code> – {c.name}
            </li>
          ))}
        </ul>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Pay for another class?</h3>
            <p className="mt-2 text-gray-300">
              You already paid for {confirmModal.classesCount} class(es) today for this course. Pay ₹10 for one more?
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirmModal(null)} className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmExtra} disabled={loading} className="flex-1 rounded-lg bg-violet-600 py-2.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50">
                {loading ? '...' : 'Yes, pay ₹10'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

