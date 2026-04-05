// Replace these with your actual values before deployment.

/** WhatsApp number with country code, no + or spaces (e.g. 919876543210) */
export const WHATSAPP_NUMBER = '919986437890'

// Logo asset used in places like navbar/home hero branding.
export const LOGO_SRC = '/nita-logo.png'

// Program start date used for Home page hero.
export const PROGRAM_START_DATE = '25 March 2026'

// WhatsApp CTA text shown on Home and other pages.
export const WHATSAPP_CTA = 'For admissions and batches, chat on WhatsApp'
export const INSTAGRAM_URL = 'https://instagram.com/nitaclasses'
export const FACEBOOK_URL = 'https://facebook.com/nitaclasses'
export const YOUTUBE_URL = 'https://youtube.com/@nitaclasses'

/** Form submission: Google Apps Script web app URL or Formspree form endpoint */
export const FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

// Wallet recharge UPI details (update with your real UPI IDs)
export const WALLET_PAYEE_NAME = 'NITA Classes(Nilanchal Sahu)'
export const WALLET_UPI_ID_PHONEPE = '9040358148@ybl'
export const WALLET_UPI_ID_AMAZONPAY = '9040358148@apl'
export const WALLET_UPI_ID_PAYTM = '9040358148@ptyes'

/** Seconds shown on wallet QR step before user confirms payment (informational). */
export const WALLET_PAYMENT_TIMER_SECONDS = 300

/**
 * Fallback QR paths when server env WALLET_QR_DRIVE_URL_* is not set (see server .env.example).
 * Prefer hosting QR images in Google Drive and setting env vars so payment QRs are not in /public.
 */
export const WALLET_QR_IMAGES = {
  phonepe: '/wallet-qr-phonepe.png',
  amazonpay: '/wallet-qr-amazonpay.png',
  paytm: '/wallet-qr-paytm.png',
}
