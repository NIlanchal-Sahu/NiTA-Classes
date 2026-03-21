# Vercel → Backend API proxy

`vercel.json` forwards browser calls to `/api/*` to your Render backend.

If your Render URL is **not** `https://nita-classes-api.onrender.com`, edit `vercel.json`:

```json
"destination": "https://YOUR-SERVICE-NAME.onrender.com/api/$1"
```

Then redeploy on Vercel (or push to `main` if auto-deploy is on).

Test after deploy:

- `https://YOUR-VERCEL-DOMAIN.vercel.app/api/health` → should return `{ "ok": true }`
