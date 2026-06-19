# Vercel → Backend API proxy

`vercel.json` forwards browser calls to `/api/*` to your Render backend.

If your Render URL is **not** `https://nita-classes-api.onrender.com`, edit `vercel.json`:

```json
"destination": "https://YOUR-SERVICE-NAME.onrender.com/api/$1"
```

Then redeploy on Vercel (or push to `main` if auto-deploy is on).

Test after deploy:

- `https://YOUR-VERCEL-DOMAIN.vercel.app/api/health` → should return `{ "ok": true }`
- `https://YOUR-VERCEL-DOMAIN.vercel.app/api/health/storage` → check `courseContent.dcaModules` is **11** (not 0)

## DCA course content on live

The API on Render loads `academy_course_content.json` (~2 MB) from git. It is **not** synced to Google Sheets (Sheets cells max 50k characters).

After pushing updates, **redeploy the Render service** (`nita-classes-api`). On startup the API skips Sheets overwrite for course content and auto-restores from GitHub if DCA modules are empty.

If live still shows 0 modules, open `/api/health/storage` and confirm `courseContent.ok` is true.
