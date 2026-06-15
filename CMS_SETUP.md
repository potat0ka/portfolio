# Portfolio CMS Setup Guide

This guide walks through configuring the Django Admin CMS for the Dota 2–themed portfolio, including Supabase Storage, Vercel deployment, and frontend integration.

---

## Overview


| Layer                | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| **Admin CMS**        | Content management at `/admin-panel/` (staff only)                      |
| **Supabase Storage** | All uploads (images, PDFs) — no local filesystem in production          |
| **Public API**       | `/api/`* endpoints consumed by the React/Vite frontend                  |
| **Frontend**         | Loads profile, CV, settings, testimonials, and certificates dynamically |


Changes made in the admin panel appear on the live site immediately — no redeploy required.

---

## 1. Prerequisites

- Python 3.11+ and Node.js 18+
- A [Supabase](https://supabase.com) project
- PostgreSQL for production (recommended; SQLite works for local dev)
- Vercel account (portfolio is deployed there)

---

## 2. Local Development Setup

### 2.1 Install dependencies

```bash
# Frontend
npm install

# Backend
pip install -r backend/requirements.txt
```

### 2.2 Environment variables

Copy the example env file and fill in values:

```bash
cp backend/.env.example backend/.env
```

Minimum for local dev:

```env
DJANGO_DEBUG=true
DJANGO_SECRET_KEY=your-local-secret-key
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

Without Supabase credentials, uploads fall back to `media/` on disk **only when `DJANGO_DEBUG=true`**. Production requires Supabase (see Section 3).

### 2.3 Database & admin user

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 2.4 Run locally

```bash
# Terminal 1 — Django
cd backend
python manage.py runserver

# Terminal 2 — Vite dev server (proxies /api to Django)
npm run dev
```

Open:

- Portfolio: `http://localhost:5173`
- Admin CMS: `http://localhost:8000/admin-panel/`

---

## 3. Supabase Storage Setup

All uploaded files must live in Supabase Storage. Do **not** rely on Django `MEDIA_ROOT` or Vercel filesystem in production.

### 3.1 Create storage buckets

In **Supabase Dashboard → Storage**, create three **public** buckets:


| Bucket name      | Contents                            |
| ---------------- | ----------------------------------- |
| `profile-assets` | Profile photo, hero/banner image    |
| `cv-files`       | Active CV PDF                       |
| `certificates`   | Certificate PDFs and preview images |


For each bucket:

1. Click **New bucket**
2. Name it exactly as above
3. Enable **Public bucket** (files are served via public URLs to the frontend)

### 3.2 Generate S3-compatible access keys

1. Go to **Project Settings → Storage**
2. Under **S3 Access Keys**, create a new key pair
3. Note the **Access Key ID** and **Secret Access Key**
4. Copy your **S3 Endpoint** (format: `https://<project-ref>.supabase.co/storage/v1/s3`)

### 3.3 Configure environment variables

Add these to Vercel (and `backend/.env` for local Supabase testing):

```env
AWS_ACCESS_KEY_ID=your_supabase_s3_access_key
AWS_SECRET_ACCESS_KEY=your_supabase_s3_secret_key
AWS_S3_ENDPOINT_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1/s3
AWS_S3_REGION_NAME=auto
AWS_STORAGE_BUCKET_NAME=profile-assets
SUPABASE_BUCKET_PROFILE=profile-assets
SUPABASE_BUCKET_CV=cv-files
SUPABASE_BUCKET_CERTIFICATES=certificates
```

When `DJANGO_DEBUG=false`, set Supabase env vars on Vercel so admin uploads persist. The build itself no longer crashes if they are missing, but `/__readyz` will report `"storage": {"configured": false}` until they are added.

### 3.4 File replacement behavior

The CMS enforces single active assets where applicable:


| Asset                       | Rule                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| Profile photo               | One active photo; upload replaces and deletes the old file from Supabase |
| Hero image                  | One active banner; upload replaces and deletes the old file              |
| CV PDF                      | One active CV; upload replaces and deletes the old PDF                   |
| Certificate PDF / thumbnail | Per certificate; replacing either file deletes the previous version      |


### 3.5 Allowed file types


| Type   | Extensions                   | Max size |
| ------ | ---------------------------- | -------- |
| Images | `jpg`, `jpeg`, `png`, `webp` | 8 MB     |
| PDFs   | `pdf`                        | 12 MB    |


---

## 4. Vercel Deployment

### 4.1 Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

```env
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=<strong-random-secret>
DJANGO_ALLOWED_HOSTS=bigendra.com.np,www.bigendra.com.np,potatoka.vercel.app,.vercel.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://bigendra.com.np,https://www.bigendra.com.np,https://potatoka.vercel.app
DATABASE_URL=postgres://...

# Supabase (Section 3.3)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_ENDPOINT_URL=...
AWS_S3_REGION_NAME=auto
SUPABASE_BUCKET_PROFILE=profile-assets
SUPABASE_BUCKET_CV=cv-files
SUPABASE_BUCKET_CERTIFICATES=certificates
```

Optional but recommended:

```env
CORS_ALLOWED_ORIGINS=https://www.bigendra.com.np,https://bigendra.com.np,https://potatoka.vercel.app
DJANGO_LOG_LEVEL=INFO
```

### 4.2 Routes

`vercel.json` already rewrites these paths to the Django serverless handler:

- `/api/*`
- `/admin-panel/*`
- `/admin/*` (redirects to `/admin-panel/`)

### 4.3 Post-deploy steps

After the first deploy:

```bash
# Run against production DB (via Vercel CLI or local with DATABASE_URL)
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

Then log in at `https://www.bigendra.com.np/admin-panel/`.

---

## 5. Admin CMS Usage

### 5.1 Access


| URL                   | Behavior                              |
| --------------------- | ------------------------------------- |
| `/admin-panel/`       | Main dashboard (staff/superuser only) |
| `/admin-panel/login/` | Login page                            |
| `/admin/`             | Redirects to `/admin-panel/`          |


Unauthenticated users are redirected to the login page automatically.

### 5.2 Dashboard

The home screen shows:

- Testimonial counts (total, pending, approved, rejected)
- Link to pending testimonials queue
- Active profile photo preview
- Active CV status and last updated time
- Total certifications published to the LEARN tab

### 5.3 Content sections

#### Site Settings

Edit: full name, title, bio, location, phone, WhatsApp, Viber, email, GitHub, LinkedIn.

Only one settings record exists (singleton).

#### Profile & Hero Assets

- **Profile photo** — shown on the home hero card and about section
- **Hero / banner image** — used as the virtual shield / banner asset

Uploading a new file replaces the previous one in Supabase.

#### CV Asset

Upload the latest CV PDF. The frontend download button and PDF preview always use this file.

#### Certifications (LEARN tab)

For each certificate:

- Title, issuer, issue date, description
- Optional thumbnail image (preview in lightbox)
- Certificate PDF (required)

Visitors see flip cards on the LEARN tab; clicking **View Certificate** opens a fullscreen PDF lightbox with zoom, download, and open-in-new-tab.

#### Testimonials


| Action      | How                                                                |
| ----------- | ------------------------------------------------------------------ |
| **Approve** | Change status to *Approved*, or use bulk action *Approve selected* |
| **Reject**  | Change status to *Rejected*, or bulk action                        |
| **Delete**  | Select and delete from changelist                                  |
| **Filter**  | Use sidebar filter: Pending / Approved / Rejected                  |
| **Search**  | Search by name, email, or message                                  |


Only **approved** testimonials appear on the public site via `/api/testimonials/`.

New visitor submissions via the portfolio form are created as **Pending** automatically.

---

## 6. Public API Reference

Base URL: `/api`


| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| `GET`  | `/api/settings/`     | Site settings (name, bio, contact, social) |
| `GET`  | `/api/profile/`      | Profile photo + hero image URLs            |
| `GET`  | `/api/cv/`           | CV PDF URL + `updated_at`                  |
| `GET`  | `/api/certificates/` | All certifications with Supabase URLs      |
| `GET`  | `/api/testimonials/` | Approved testimonials only (max 50)        |
| `POST` | `/api/testimonials/` | Submit a new testimonial (→ pending)       |


All file fields return absolute Supabase URLs when storage is configured.

### Example responses

**GET `/api/settings/`**

```json
{
  "id": 1,
  "full_name": "Bigendra Shrestha",
  "title": "Python & AI Trainee",
  "bio": "...",
  "location": "Kathmandu, Nepal",
  "phone": "+977 9860297032",
  "email": "you@example.com",
  "github": "https://github.com/...",
  "linkedin": "https://linkedin.com/in/..."
}
```

**GET `/api/profile/`**

```json
{
  "id": 1,
  "profile_photo": "https://....supabase.co/storage/v1/object/public/profile-assets/...",
  "hero_image": "https://....supabase.co/storage/v1/object/public/profile-assets/...",
  "updated_at": "2026-06-11T12:00:00Z"
}
```

**GET `/api/cv/`**

```json
{
  "id": 1,
  "cv_pdf": "https://....supabase.co/storage/v1/object/public/cv-files/resume.pdf",
  "updated_at": "2026-06-11T12:00:00Z"
}
```

**POST `/api/testimonials/`**

```json
{
  "author_name": "Jane Doe",
  "author_email": "jane@example.com",
  "message": "Great portfolio and clean code practices."
}
```

---

## 7. Frontend Integration

The React app fetches all dynamic content from the API. Key files:


| File                                     | Role                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/hooks/usePortfolioApi.ts`           | API hooks: `useSiteSettings`, `useProfileAsset`, `useCVAsset`, `useCertifications` |
| `src/components/CertificateCard.tsx`     | LEARN tab 3D flip cards                                                            |
| `src/components/CertificateLightbox.tsx` | Fullscreen PDF viewer modal                                                        |
| `src/App.tsx`                            | Wires API data into hero, contact, CV, testimonials                                |


### React usage example

```tsx
import {
  useSiteSettings,
  useProfileAsset,
  useCVAsset,
  useCertifications,
  buildContactMethods,
} from "./hooks/usePortfolioApi";

function Portfolio() {
  const { data: settings } = useSiteSettings();
  const { data: profile } = useProfileAsset();
  const { data: cv } = useCVAsset();
  const { data: certs, loading: certsLoading } = useCertifications();

  const contactMethods = buildContactMethods(settings);

  return (
    <>
      <img src={profile.profile_photo ?? "/profilephoto.jpeg"} alt={settings.full_name} />
      {cv.cv_pdf && <a href={cv.cv_pdf} download>Download CV</a>}
      {certs.map((cert) => (
        <div key={cert.id}>{cert.title}</div>
      ))}
    </>
  );
}
```

API requests use `cache: "no-store"` so admin updates are visible on the next page load without redeploying.

---

## 8. Security


| Control            | Implementation                              |
| ------------------ | ------------------------------------------- |
| Admin access       | Django `is_staff` / `is_superuser` required |
| CSRF               | Enabled on all admin forms                  |
| Public API         | Read-only except testimonial POST           |
| Testimonials       | Moderation required before public display   |
| File validation    | Extension + size checks on upload           |
| Production storage | Supabase only when `DJANGO_DEBUG=false`     |
| Secrets            | Never commit `.env`; use Vercel env vars    |


---

## 9. Troubleshooting

### Build failed on Vercel (`exited with 1`)

The build runs: `npm run build && python scripts/vercel_build.py`

Common causes:

1. `**DJANGO_SECRET_KEY` missing** when `DJANGO_DEBUG=false` — set a strong secret on Vercel.
2. `**DATABASE_URL` missing at build time** — migrate is skipped if unset; set it for all environments if you want migrations during build.
3. **Python deps missing** — `installCommand` installs from `requirements.txt`; redeploy after changing it.

The build no longer hard-crashes when Supabase env vars are absent, but uploads will not work until they are configured.

### Verify Supabase after deploy

Open:

```
https://www.bigendra.com.np/__readyz
```

Example healthy response:

```json
{
  "status": "ready",
  "db_alive": true,
  "storage": {
    "configured": true,
    "ok": true,
    "endpoint": "https://xxxx.supabase.co/storage/v1/s3",
    "buckets": {
      "profile-assets": "ok",
      "cv-files": "ok",
      "certificates": "ok"
    }
  }
}
```

If `"configured": false` — add Supabase S3 env vars on Vercel and redeploy.

If `"ok": false` with bucket errors — create the missing buckets in Supabase Storage and mark them **public**.

Ensure `vercel.json` includes a rewrite for `/admin-panel/(.*)` → `/api/index.py`. Redeploy after changes.

### Uploads fail in production

1. Confirm all Supabase env vars are set on Vercel
2. Verify bucket names match exactly (`profile-assets`, `cv-files`, `certificates`)
3. Confirm buckets are **public**
4. Check S3 access keys are active in Supabase

### Images/PDFs not showing on frontend

1. Open `/api/profile/` or `/api/cv/` in the browser — URLs should be full `https://...supabase.co/...` paths
2. If URLs are relative (`/media/...`), Supabase credentials are missing in that environment
3. Confirm the file exists in the Supabase bucket dashboard

### Testimonials not appearing

- Status must be **Approved**
- `is_public` is set automatically when approved
- Only approved entries are returned by `GET /api/testimonials/`

### CV download button disabled

No CV has been uploaded yet. Upload one via **Admin → CV Asset**.

### Run tests locally

```bash
cd backend
python manage.py test apps.core
```

---

## 10. Quick Start Checklist

- [ ] Create Supabase project
- [ ] Create buckets: `profile-assets`, `cv-files`, `certificates` (public)
- [ ] Generate S3 access keys and set env vars
- [ ] Set `DATABASE_URL` and `DJANGO_SECRET_KEY` on Vercel
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py createsuperuser`
- [ ] Log in at `/admin-panel/`
- [ ] Upload profile photo, hero image, and CV
- [ ] Edit site settings (name, bio, contact)
- [ ] Add certifications for the LEARN tab
- [ ] Approve pending testimonials
- [ ] Verify `/api/settings/`, `/api/profile/`, `/api/cv/`, `/api/certificates/` return expected data

---

## Related files

```
backend/apps/core/models.py           # Data models + file replacement
backend/apps/core/admin.py            # Admin registrations + moderation
backend/apps/core/api.py              # Public API views
backend/config/storage_backends.py    # Supabase S3 bucket backends
backend/config/settings.py            # Django + storage configuration
templates/admin/dashboard_stats.html  # Admin dashboard widgets
vercel.json                           # Vercel route rewrites
src/hooks/usePortfolioApi.ts          # Frontend API hooks
```
