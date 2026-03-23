# Student profile — Google Drive & Sheets (optional)

Files and structured data are **always saved on the NITA server** (`server/data/student_profiles.json` + `server/uploads/student-profiles/`).  
**Google sync** runs only when credentials and IDs below are set.

## 1. Google Cloud setup

1. Create a project → enable **Google Drive API** and **Google Sheets API**.
2. Create a **Service account** → download JSON key.
3. Place the JSON on the server, e.g. `server/google-service-account.json` (add to `.gitignore` — never commit keys).

Or set:

```env
GOOGLE_SERVICE_ACCOUNT_PATH=D:/path/to/service-account.json
# OR paste JSON (for hosts that support multiline env):
# GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## 2. Google Drive

1. Create a folder in Drive (e.g. `NITA_Students`) owned by you.
2. **Share that folder** with the service account email (from the JSON, `client_email`) as **Editor**.
3. Copy the folder ID from the URL:  
   `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

```env
GOOGLE_DRIVE_PARENT_FOLDER_ID=FOLDER_ID_HERE
```

Optional — share uploaded files with your Gmail:

```env
GOOGLE_DRIVE_SHARE_EMAIL=tech.nilanchala25@gmail.com
```

Subfolders are created automatically: `FullName_authUserId/`.

**Two photos:** **Portal avatar** (header) and **passport-size photo** (certificates) are stored and synced as separate files (`portal_*` vs `passport_*` on Drive).

## 3. Google Sheets

1. Create a spreadsheet. **Share** it with the service account email as **Editor**.
2. Create a tab named `Students` (or set a custom name).
3. Copy the spreadsheet ID from the URL.

```env
GOOGLE_SHEETS_SPREADSHEET_ID=spreadsheet_id_from_url
GOOGLE_SHEETS_TAB_NAME=Students
```

The first sync will write a header row if the sheet is empty. Rows are **updated** when the same **Aadhaar** or **Auth User ID** matches; otherwise a **new row** is appended.

## 4. Restart API

Restart `npm run dev:all` or production server after changing `.env`.

If sync is not configured, the app still works: data stays on the server only.
