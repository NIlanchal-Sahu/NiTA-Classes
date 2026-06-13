import nodemailer from 'nodemailer'

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function adminEmailRecipients() {
  const raw = String(process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || '').trim()
  if (!raw) return []
  return raw.split(',').map((x) => x.trim()).filter(Boolean)
}

function adminWhatsAppNumber() {
  const n = String(process.env.ADMIN_WHATSAPP || process.env.WHATSAPP_NUMBER || '919986437890')
    .replace(/\D/g, '')
  if (n.length === 10) return `91${n}`
  return n
}

export function buildAdminWhatsAppUrl(message) {
  const text = encodeURIComponent(String(message || '').trim())
  return `https://wa.me/${adminWhatsAppNumber()}?text=${text}`
}

async function sendEmail({ to, subject, text, html }) {
  if (!isSmtpConfigured()) return { sent: false, reason: 'smtp_not_configured' }
  const recipients = Array.isArray(to) ? to : [to]
  if (!recipients.length) return { sent: false, reason: 'no_recipients' }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipients.join(', '),
    subject,
    text,
    html,
  })
  return { sent: true }
}

/** Notify admin by email + return WhatsApp deep link for alerts panel. */
export async function notifyAdminOnlinePayment({ enrollment, account }) {
  const name = String(enrollment?.studentName || '').trim()
  const phone = String(enrollment?.mobile || '').trim()
  const course = String(enrollment?.courseName || enrollment?.courseId || '')
  const amount = Number(enrollment?.amount) || 0
  const paymentId = String(enrollment?.razorpayPaymentId || '')

  const lines = [
    `New online enrollment — NITA Classes`,
    ``,
    `Student: ${name}`,
    `Mobile: ${phone}`,
    `Course: ${course}`,
    `Amount paid: ₹${amount}`,
    `Razorpay payment ID: ${paymentId || '—'}`,
  ]

  if (account?.studentId) {
    lines.push(`Student ID: ${account.studentId}`)
    lines.push(account.isNewAccount ? 'Account: newly created' : 'Account: existing (linked)')
  }

  const text = lines.join('\n')
  const whatsappNotifyUrl = buildAdminWhatsAppUrl(
    `New online enrollment at NITA Classes: ${name} (${phone}) paid ₹${amount} for ${course}. Payment ID: ${paymentId}`,
  )

  let emailResult = { sent: false, reason: 'skipped' }
  try {
    emailResult = await sendEmail({
      to: adminEmailRecipients(),
      subject: `[NITA] Online enrollment — ${name} — ₹${amount}`,
      text,
      html: `<pre style="font-family:sans-serif;font-size:14px;line-height:1.5">${text.replace(/\n/g, '<br>')}</pre>`,
    })
  } catch (e) {
    console.warn('[adminNotify] email failed:', e.message)
    emailResult = { sent: false, reason: e.message }
  }

  return { whatsappNotifyUrl, emailResult }
}

/** Optional welcome email to student when email provided on enroll form. */
export async function notifyStudentOnlineEnrollment({ enrollment, account }) {
  const email = String(enrollment?.email || '').trim()
  if (!email || !email.includes('@')) return { sent: false, reason: 'no_student_email' }

  const lines = [
    `Hi ${enrollment.studentName},`,
    ``,
    `Thank you for enrolling in ${enrollment.courseName} at NITA Classes.`,
    `We received your payment of ₹${enrollment.amount}.`,
    ``,
  ]

  if (account?.isNewAccount && account.studentId && account.plainPassword) {
    lines.push(`Your student portal login:`)
    lines.push(`Student ID: ${account.studentId}`)
    lines.push(`Mobile login: ${enrollment.mobile}`)
    lines.push(`Password: ${account.plainPassword}`)
    lines.push(``)
    lines.push(`Please change your password after first login.`)
  } else if (account?.studentId) {
    lines.push(`Your existing student account (${account.studentId}) has been linked to this enrollment.`)
  }

  lines.push(``, `Login: ${process.env.PUBLIC_APP_URL || 'https://your-nita-site.vercel.app'}/login`)

  try {
    return await sendEmail({
      to: email,
      subject: `Enrollment confirmed — ${enrollment.courseName} — NITA Classes`,
      text: lines.join('\n'),
    })
  } catch (e) {
    console.warn('[adminNotify] student email failed:', e.message)
    return { sent: false, reason: e.message }
  }
}
