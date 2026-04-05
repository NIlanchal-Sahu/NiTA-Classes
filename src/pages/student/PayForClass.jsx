import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentPortalApi, scanToPay, purchaseUnlimitedPromo, getWalletQrConfig } from '../../api/student'
import {
  WALLET_PAYEE_NAME,
  WALLET_UPI_ID_PHONEPE,
  WALLET_UPI_ID_AMAZONPAY,
  WALLET_UPI_ID_PAYTM,
  WALLET_QR_IMAGES,
  WALLET_PAYMENT_TIMER_SECONDS,
} from '../../config'

const VVIP_PRICE = 699

/**
 * UPI deep links for the selected app (best on mobile with app installed).
 * Amazon Pay uses standard `upi://` so the system can route to Amazon Pay / any UPI app.
 */
function buildUpiAppDeepLink(platform, payeeAddress, payeeName, amount) {
  const am = Number(amount).toFixed(2)
  const pn = encodeURIComponent(payeeName)
  const pa = encodeURIComponent(payeeAddress)
  const tn = encodeURIComponent('NITA wallet recharge')
  const q = `pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`
  switch (platform) {
    case 'phonepe':
      return `phonepe://pay?${q}`
    case 'paytm':
      return `paytmmp://pay?${q}`
    case 'amazonpay':
      return `upi://pay?${q}`
    default:
      return `upi://pay?${q}`
  }
}

export default function PayForClass() {
  const [searchParams] = useSearchParams()
  const { user, refreshUser } = useAuth()

  /** Unlocked courses only (from Explore); used for Pay ₹10 dropdown */
  const [learnCourses, setLearnCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const walletBalance = Number(user?.walletBalance) || 0
  const totalClasses = user?.totalClassesAttended ?? 0
  const vvipValidUntil = user?.vvipValidUntil || null
  const isVvip =
    vvipValidUntil && String(vvipValidUntil).slice(0, 10) >= new Date().toISOString().slice(0, 10)

  const [promoLoading, setPromoLoading] = useState(false)
  const [promoSuccess, setPromoSuccess] = useState(null)
  const [vvipModalOpen, setVvipModalOpen] = useState(false)

  const [feesData, setFeesData] = useState(null)
  const [requestAmount, setRequestAmount] = useState('')
  const [requestPlatform, setRequestPlatform] = useState('phonepe')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestNote, setRequestNote] = useState('')
  const [screenshotDataUrl, setScreenshotDataUrl] = useState('')
  const [screenshotName, setScreenshotName] = useState('')

  /** Wallet modal: 'qr' = scan / pay question; 'upload' = screenshot + submit (same popup) */
  const [walletModalStep, setWalletModalStep] = useState('qr')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrImgError, setQrImgError] = useState(false)
  const [timerLeft, setTimerLeft] = useState(0)
  const timerRef = useRef(null)
  const [driveQrUrls, setDriveQrUrls] = useState(null)

  const upiId =
    requestPlatform === 'phonepe'
      ? WALLET_UPI_ID_PHONEPE
      : requestPlatform === 'amazonpay'
        ? WALLET_UPI_ID_AMAZONPAY
        : WALLET_UPI_ID_PAYTM

  const driveUrlForPlatform =
    requestPlatform === 'phonepe'
      ? driveQrUrls?.phonepe
      : requestPlatform === 'amazonpay'
        ? driveQrUrls?.amazonpay
        : driveQrUrls?.paytm
  const qrImageSrc =
    driveUrlForPlatform && String(driveUrlForPlatform).startsWith('http')
      ? driveUrlForPlatform
      : requestPlatform === 'phonepe'
        ? WALLET_QR_IMAGES.phonepe
        : requestPlatform === 'amazonpay'
          ? WALLET_QR_IMAGES.amazonpay
          : WALLET_QR_IMAGES.paytm

  useEffect(() => {
    getWalletQrConfig()
      .then((cfg) => setDriveQrUrls(cfg))
      .catch(() => setDriveQrUrls(null))
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const out = await studentPortalApi.getFees()
        setFeesData(out)
      } catch {
        // ignore
      }
    })()
  }, [walletBalance])

  useEffect(() => {
    ;(async () => {
      setCoursesLoading(true)
      try {
        const out = await studentPortalApi.getCoursesLearning()
        const enrolled =
          out.enrolledCourses || (out.allCourses || []).filter((c) => c.unlocked)
        const list = enrolled.filter((c) => String(c.id) !== 'trial-course')
        setLearnCourses(list)
      } catch {
        setLearnCourses([])
      } finally {
        setCoursesLoading(false)
      }
    })()
  }, [walletBalance])

  useEffect(() => {
    const fromQr = searchParams.get('course') || searchParams.get('c')
    if (!fromQr || !learnCourses.length) return
    const id = fromQr.trim().toLowerCase()
    if (learnCourses.some((c) => c.id === id)) setSelectedCourseId(id)
  }, [searchParams, learnCourses])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const courseEnrolledCount = learnCourses.length

  const QUICK_AMOUNTS = [100, 200, 300, 500, 1000, 1200, 1500, 2000]
  const OFFER_TOPUPS = {
    300: 350,
    500: 600,
    1000: 1225,
    1200: 1500,
    1500: 2000,
    2000: 2700,
  }
  const creditedAmount = OFFER_TOPUPS[Number(requestAmount)] || Number(requestAmount) || 0
  const topUpAmount = Number(requestAmount) || 0

  const vvipInsufficient = walletBalance < VVIP_PRICE

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    const courseId = selectedCourseId.trim().toLowerCase() || null
    if (!courseId) {
      setError('Select the course you are attending.')
      return
    }

    setLoading(true)
    try {
      const data = await scanToPay(courseId)
      if (data.alreadyPaid) {
        setConfirmModal({ courseId, classesCount: data.classesCount })
      } else if (data.success) {
        setSuccess(data)
        await refreshUser()
        setSelectedCourseId('')
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
      const data = await scanToPay(confirmModal.courseId, { confirmMultiple: true })
      setSuccess(data)
      setConfirmModal(null)
      await refreshUser()
      setSelectedCourseId('')
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const openQrModal = async () => {
    setError('')
    if (!topUpAmount || topUpAmount < 1) {
      setError('Select a recharge amount first.')
      return
    }
    try {
      await studentPortalApi.notifyPaymentAttempt({
        topUpAmount,
        platform: requestPlatform,
        creditedAmount,
      })
    } catch (err) {
      setError(err.message || 'Could not notify admin. Try again.')
      return
    }
    setWalletModalStep('qr')
    setQrImgError(false)
    setQrModalOpen(true)
    setTimerLeft(WALLET_PAYMENT_TIMER_SECONDS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimerLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const closeQrModal = () => {
    setQrModalOpen(false)
    setWalletModalStep('qr')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const onPaymentSuccessYes = () => {
    setWalletModalStep('upload')
  }

  const onPaymentSuccessNo = () => {
    closeQrModal()
    setError('')
  }

  const fmtTimer = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const platformLabel =
    requestPlatform === 'phonepe' ? 'PhonePe' : requestPlatform === 'amazonpay' ? 'Amazon Pay' : 'Paytm'

  const openSelectedUpiApp = () => {
    if (!topUpAmount || topUpAmount < 1) return
    const url = buildUpiAppDeepLink(requestPlatform, upiId, WALLET_PAYEE_NAME, topUpAmount)
    window.location.assign(url)
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Pay for Class</h1>
      <p className="mt-1 text-gray-400">
        Choose a course you have unlocked, then pay ₹10 per class (or use VVIP). Unlock courses from Explore first.
      </p>

      <div className="mt-6 flex flex-wrap gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <div>
          <p className="text-sm text-gray-400">Wallet balance</p>
          <p className="text-xl font-bold text-white">₹{walletBalance}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Classes attended (total)</p>
          <p className="text-xl font-bold text-white">{totalClasses}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Courses enrolled</p>
          <p className="text-xl font-bold text-white">{courseEnrolledCount}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <div>
          <label htmlFor="course-attend" className="block text-sm font-medium text-gray-300">
            Select class you want to attend
          </label>
          {coursesLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading your courses…</p>
          ) : learnCourses.length === 0 ? (
            <div className="mt-3 rounded-xl border border-violet-500/40 bg-gradient-to-br from-violet-950/50 to-gray-900 px-4 py-6 text-center">
              <p
                className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-[length:200%_100%] bg-clip-text text-lg font-extrabold tracking-wide text-transparent animate-shimmer"
              >
                Unlock a course to attend the classes
              </p>
              <p className="mt-2 text-sm text-gray-400">Pay the unlock fee from your wallet on Explore, then return here.</p>
              <Link
                to="/student/explore"
                className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Go to Explore — unlock a course
              </Link>
            </div>
          ) : (
            <select
              id="course-attend"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
              <option value="">— Choose a course —</option>
              {learnCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.title || c.id}
                </option>
              ))}
            </select>
          )}
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
          disabled={
            loading ||
            coursesLoading ||
            learnCourses.length === 0 ||
            !selectedCourseId ||
            (!isVvip && walletBalance < 10)
          }
          className="btn-touch rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600"
        >
          {loading ? 'Processing...' : isVvip ? 'Submit (VVIP – no charge)' : 'Submit & Pay ₹10'}
        </button>
      </form>

      {/* Wallet Recharge — QR first, then upload after successful payment */}
      <div className="mt-6 rounded-xl border border-blue-700/40 bg-blue-900/10 p-5">
        <h3 className="font-medium text-white">Wallet Recharge (UPI — scan QR)</h3>
        <p className="mt-1 text-sm text-gray-300">
          1) Select amount · 2) Select app · 3) Tap <strong className="text-white">Show QR & pay</strong> — scan or <strong className="text-white">Open … to pay</strong> · 4) If payment succeeded, tap Yes — upload screenshot and submit in the <strong className="text-white">same popup</strong> · After approval, offer credit is added to wallet.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-gray-200">Select amount</label>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRequestAmount(String(amt))}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                    Number(requestAmount) === amt
                      ? 'border-blue-400 bg-blue-600 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-300">
              Selected: <span className="font-semibold text-white">{requestAmount ? `₹${requestAmount}` : '—'}</span>
              {creditedAmount ? (
                <>
                  {' '}
                  · Wallet credit after approval:{' '}
                  <span className="font-semibold text-emerald-300">₹{creditedAmount}</span>
                </>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-200">Platform (QR)</label>
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
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-900/20 px-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-200">UPI ID ({platformLabel})</div>
                <div className="mt-1 font-mono text-sm font-bold text-white">{upiId}</div>
                <div className="mt-1 text-xs text-gray-300">Payee: {WALLET_PAYEE_NAME}</div>
              </div>
              <button
                type="button"
                disabled={!topUpAmount}
                onClick={openQrModal}
                className="btn-touch shrink-0 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                Show QR & pay
              </button>
            </div>
          </div>

        </div>
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-200">
          <div className="font-semibold">Recharge offers</div>
          <div className="mt-1">Add ₹300 get ₹350 · ₹500 get ₹600 · ₹1000 get ₹1225 · ₹1200 get ₹1500 · ₹1500 get ₹2000 · ₹2000 get ₹2700</div>
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
                <tr>
                  <td colSpan={3} className="px-3 py-3 text-gray-500">
                    No payment history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-5">
        <h3 className="font-semibold text-white">Unlimited Classes for one month at ₹{VVIP_PRICE} only</h3>
        <p className="mt-1 text-sm text-gray-300">
          Pay once from wallet. Become a <strong className="text-amber-400">VVIP Student</strong> and attend any classes
          without paying ₹10 class fee until the same date next month.
        </p>

        {promoSuccess && <p className="mt-3 text-sm text-emerald-400">{promoSuccess}</p>}

        {isVvip ? (
          <p className="mt-3 text-sm text-amber-300">You are VVIP until {String(vvipValidUntil).slice(0, 10)}.</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError('')
              setPromoSuccess(null)
              setVvipModalOpen(true)
            }}
            className="mt-3 btn-touch rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400"
          >
            Buy now – ₹{VVIP_PRICE}
          </button>
        )}
      </div>

      {/* Wallet: QR + upload in same modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            {walletModalStep === 'qr' ? (
              <>
                <h3 className="text-lg font-semibold text-white">Scan & pay</h3>
                <p className="mt-1 text-sm text-gray-300">
                  Pay <span className="font-semibold text-white">₹{topUpAmount}</span> using {platformLabel}. Credit after approval:{' '}
                  <span className="text-emerald-300">₹{creditedAmount}</span>
                </p>
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-900/20 px-3 py-2 text-center">
                  <p className="text-xs text-amber-200/90">Time remaining</p>
                  <p className="text-2xl font-mono font-bold text-amber-300">{fmtTimer(timerLeft)}</p>
                </div>
                <div className="mt-4 flex min-h-[200px] justify-center rounded-lg border border-gray-600 bg-white p-3">
                  {!qrImgError ? (
                    <img
                      src={qrImageSrc}
                      alt={`${platformLabel} QR`}
                      className="max-h-64 w-auto max-w-full object-contain"
                      onError={() => setQrImgError(true)}
                    />
                  ) : (
                    <div className="max-w-full p-4 text-center text-sm text-gray-700">
                      <p className="font-semibold">QR image not found</p>
                      <p className="mt-2">
                        Add <code className="rounded bg-gray-200 px-1">public{qrImageSrc}</code> or pay using UPI ID:
                      </p>
                      <p className="mt-2 font-mono font-bold">{upiId}</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center font-mono text-sm text-gray-300">{upiId}</p>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={openSelectedUpiApp}
                    className="btn-touch w-full rounded-lg border border-cyan-500/50 bg-cyan-700/40 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700/60"
                  >
                    Open {platformLabel} to pay ₹{topUpAmount}
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    Opens the selected UPI app on your phone. On desktop, scan the QR with your phone or copy the UPI ID.
                  </p>
                </div>

                <p className="mt-4 text-sm font-medium text-white">Is your payment successful?</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={onPaymentSuccessNo}
                    className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={onPaymentSuccessYes}
                    className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700"
                  >
                    Yes
                  </button>
                </div>
                <button type="button" onClick={closeQrModal} className="mt-4 w-full text-sm text-gray-400 hover:text-white">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white">Submit payment request</h3>
                <p className="mt-1 text-sm text-gray-300">
                  Upload your payment screenshot and submit. Admin will verify and credit <span className="text-emerald-300">₹{creditedAmount}</span> to your wallet after approval.
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-200">Payment screenshot *</label>
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
                    {screenshotName ? <div className="mt-1 text-xs text-gray-400">{screenshotName}</div> : null}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-200">UPI Txn ID / note (optional)</label>
                    <input
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      placeholder="e.g. transaction reference"
                      className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={requestLoading || !screenshotDataUrl || !topUpAmount}
                    onClick={async () => {
                      setRequestLoading(true)
                      setError('')
                      try {
                        await studentPortalApi.createPaymentRequest({
                          amount: creditedAmount,
                          platform: requestPlatform,
                          screenshot: screenshotDataUrl,
                          note: requestNote,
                          mode: 'upi',
                        })
                        setRequestAmount('')
                        setRequestNote('')
                        setScreenshotDataUrl('')
                        setScreenshotName('')
                        closeQrModal()
                        await refreshUser()
                        const out = await studentPortalApi.getFees()
                        setFeesData(out)
                        setSuccess({
                          message: 'Payment request submitted. Wallet will update after admin approval.',
                          walletBalance: user?.walletBalance,
                          totalClassesAttended: user?.totalClassesAttended,
                        })
                      } catch (err) {
                        setError(err.message || 'Failed to submit request')
                      } finally {
                        setRequestLoading(false)
                      }
                    }}
                    className="btn-touch w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {requestLoading ? 'Submitting…' : 'Submit payment request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletModalStep('qr')}
                    className="w-full rounded-lg border border-gray-600 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700"
                  >
                    Back to QR
                  </button>
                  <button
                    type="button"
                    onClick={closeQrModal}
                    className="w-full text-sm text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VVIP — same pattern as Explore unlock */}
      {vvipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Activate VVIP?</h3>
            <p className="mt-2 text-sm text-gray-300">
              <span className="font-semibold text-white">Unlimited classes for 1 month</span>
            </p>
            <p className="mt-2 text-sm text-amber-300">₹{VVIP_PRICE} will be deducted from your wallet.</p>
            {vvipInsufficient && (
              <p className="mt-2 text-sm text-red-300">Insufficient wallet balance. Please add balance first.</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setVvipModalOpen(false)}
                className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              {vvipInsufficient ? (
                <Link
                  to="/student/pay"
                  onClick={() => setVvipModalOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white hover:bg-blue-700"
                >
                  Add Balance
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={promoLoading}
                  onClick={async () => {
                    setError('')
                    setPromoSuccess(null)
                    setPromoLoading(true)
                    try {
                      const data = await purchaseUnlimitedPromo()
                      setPromoSuccess(data.message || 'You are now a VVIP Student!')
                      setVvipModalOpen(false)
                      await refreshUser()
                    } catch (err) {
                      setError(err.message || 'Purchase failed')
                    } finally {
                      setPromoLoading(false)
                    }
                  }}
                  className="flex-1 rounded-lg bg-amber-500 py-2.5 font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-50"
                >
                  {promoLoading ? '…' : `Confirm ₹${VVIP_PRICE}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Pay for another class?</h3>
            <p className="mt-2 text-gray-300">
              You already paid for {confirmModal.classesCount} class(es) today for this course. Pay ₹10 for one more?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExtra}
                disabled={loading}
                className="flex-1 rounded-lg bg-violet-600 py-2.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? '...' : 'Yes, pay ₹10'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
