import { verifyRazorpayWebhookSignature } from '../services/razorpayPayments.js'
import { completePaidCourseOrder } from '../services/courseOrderFulfillment.js'

/** Razorpay webhook — backup when user closes browser before frontend verify. */
export async function handleRazorpayWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature']
    const rawBody = req.body

    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ error: 'Invalid webhook body' })
    }

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      console.warn('[razorpay webhook] invalid signature')
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    const event = JSON.parse(rawBody.toString('utf8'))
    const eventType = event?.event || ''

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = event.payload?.payment?.entity
      const orderEntity = event.payload?.order?.entity
      const razorpayOrderId = payment?.order_id || orderEntity?.id
      const razorpayPaymentId = payment?.id

      if (razorpayOrderId && razorpayPaymentId) {
        const result = await completePaidCourseOrder({
          razorpayOrderId,
          razorpayPaymentId,
          source: 'webhook',
        })
        if (!result.ok) {
          console.warn('[razorpay webhook] fulfillment:', result.error)
        } else if (!result.alreadyProcessed) {
          console.log('[razorpay webhook] enrollment completed:', result.enrollment?.id)
        }
      }
    }

    res.json({ received: true })
  } catch (e) {
    console.error('[razorpay webhook] error:', e.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}
