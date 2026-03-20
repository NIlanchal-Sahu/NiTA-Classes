# NITA Classes – Website

A modern, responsive website for **NITA Classes** (coaching institute): computer skills, office skills, AI video editing, spoken English, and school IT classes. Mobile-first, built with React (Vite) and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Build for production: `npm run build`; preview: `npm run preview`.

**Login (password + OTP)** requires the auth server. From the project root:

```bash
npm run dev:all
```

This runs the Vite dev server and the auth API (port 3001). The frontend proxies `/api` to the backend. Without the server, the Login button will work but sign-in will fail until the API is running.

- **Password login:** Admin demo: `admin@nitaclasses.com` / `admin123`. Add more users (with hashed passwords) in `server/src/data/users.json` or via an admin API.
- **OTP login:** Choose “OTP”, enter email, click “Send OTP”. In development the OTP is shown on screen; in production configure SMTP in `server/.env` to send OTP by email.

## Before Deployment

1. **WhatsApp number**  
   Edit `src/config.js` and set `WHATSAPP_NUMBER` (e.g. `919876543210`).

2. **Contact page**  
   Update phone display, email, and Google Maps embed in `src/pages/Contact.jsx`.

3. **Admission form → Google Sheet + Email**  
   Set `FORM_ENDPOINT` in `src/config.js` to your form backend.

### Option A: Google Apps Script (Sheet + Email)

1. Create a Google Sheet with columns: Name, Mobile, Course, School, Timestamp.
2. Go to **Extensions → Apps Script**. Use a script like:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.name, data.mobile, data.course, data.school || '', new Date()]);
  // Optional: send email
  MailApp.sendEmail('your@email.com', 'New enrollment: ' + data.name, JSON.stringify(data, null, 2));
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy as **Web app** (Execute as: Me, Who has access: Anyone). Copy the web app URL into `FORM_ENDPOINT` in `src/config.js`.

### Option B: Formspree

1. Create a form at [formspree.io](https://formspree.io) with fields: name, mobile, course, school.
2. Put the form’s endpoint URL in `FORM_ENDPOINT` in `src/config.js`.  
   Note: Formspree expects form-urlencoded by default; you may need to adjust the Admission form to submit as `application/x-www-form-urlencoded` or use Formspree’s JSON endpoint if available.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS
- **Auth:** Express API (JWT, password + OTP login), optional SMTP for OTP email
- **Forms:** Validated (10-digit phone, required fields); backend via config

## Structure

- `src/pages/` – Home, Courses, Admission, About, Contact, Login
- `src/components/` – Navbar (sticky, hamburger), Footer, WhatsAppButton, ProtectedRoute
- `src/context/AuthContext.jsx` – Auth state; calls `/api/auth` (login, OTP, /me)
- `src/api/auth.js` – API helpers and token storage
- `src/config.js` – WhatsApp number and form endpoint
- `server/` – Express auth API: `POST /api/auth/login`, `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`, `GET /api/auth/me`

## SEO

Meta description and keywords are set in `index.html`. Keywords include: computer classes near me, 10 Rupees classes, AI video editing course, spoken English classes.

## Deployment

Build: `npm run build`. Deploy the `dist/` folder to Vercel, Netlify, or any static host. For client-side routing, configure redirects so all routes serve `index.html`.
