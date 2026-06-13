/**
 * Quick local Razorpay check — run from server folder:
 *   npm run test:razorpay
 */
import 'dotenv/config'

const BASE = `http://localhost:${process.env.PORT || 3001}`

async function main() {
  console.log('Testing Razorpay local setup...\n')

  const keyId = process.env.RAZORPAY_KEY_ID
  const hasSecret = Boolean(process.env.RAZORPAY_KEY_SECRET)
  const hasWebhook = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET)

  console.log('Env file (server/.env):')
  console.log('  RAZORPAY_KEY_ID:', keyId ? `${keyId.slice(0, 12)}...` : 'MISSING')
  console.log('  RAZORPAY_KEY_SECRET:', hasSecret ? 'set' : 'MISSING')
  console.log('  RAZORPAY_WEBHOOK_SECRET:', hasWebhook ? 'set' : 'MISSING')
  console.log('  PUBLIC_APP_URL:', process.env.PUBLIC_APP_URL || '(not set)')
  console.log('')

  try {
    const cfgRes = await fetch(`${BASE}/api/public/courses/payment/config`)
    const cfg = await cfgRes.json()
    console.log('API /payment/config:', cfg)
    if (!cfg.configured) {
      console.error('\nFailed: API says Razorpay is not configured. Restart: npm run dev:all')
      process.exit(1)
    }

    const orderRes = await fetch(`${BASE}/api/public/courses/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: 'dca',
        name: 'Razorpay Local Test',
        mobile: '9876543210',
      }),
    })
    const order = await orderRes.json()
    if (!orderRes.ok) {
      console.error('\nCreate order failed:', order)
      process.exit(1)
    }
    console.log('API create-order: OK —', order.razorpayOrderId)
    console.log('\nLocal setup is ready.')
    console.log('Open in browser: http://localhost:5173/enroll/dca')
    console.log('Test UPI: success@razorpay  |  Test card: 4111 1111 1111 1111')
  } catch (e) {
    console.error('\nCould not reach API at', BASE)
    console.error('Start the server first: npm run dev:all')
    console.error(e.message)
    process.exit(1)
  }
}

main()
