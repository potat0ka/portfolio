# Potatoka Portfolio & Recruitment Platform

A high-performance, full-stack portfolio platform designed for professional representation, recruitment optimization, and technical showcase.

The platform is structured as a decoupled architecture featuring a React/Vite Single Page Application (SPA) on the frontend and a robust Django REST API on the backend.

---

## 🚀 Features

- **Dynamic Interactive Profile:** High-fidelity, animated UI with "Item Shop" style skill loadouts and "Passive Aura" certification viewers.
- **Serverless Backend:** Django REST Framework API deployed to Vercel Serverless Functions for infinite scalability.
- **Supabase Integration:** PostgreSQL database with S3-compatible Supabase Storage for seamless image and PDF uploads.
- **Admin CMS Dashboard:** A customized Django admin panel allowing complete dynamic control over site content, profile data, skills, and testimonials.
- **Optimized Performance:** Pre-built static assets, API-level caching (`cache_page`), and Vercel CDN edge-caching for sub-second load times.

---

## 🏗️ Architecture

### Frontend (SPA)
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion, GSAP-style layout transitions
- **Icons:** Lucide React

### Backend (API)
- **Framework:** Django 5.2.15 + Django REST Framework
- **Language:** Python 3.10+
- **Authentication:** DRF SimpleJWT (Admin only)
- **Database:** Supabase PostgreSQL (`psycopg2-binary`)
- **Storage:** Supabase Storage via `django-storages[boto3]`

---

## 💻 Installation & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/potat0ka/portfolio.git
cd portfolio
```

### 2. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 3. Backend Setup
```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser for the CMS
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
```
The backend API and Admin panel will be available at `http://localhost:8000/admin-panel/`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory (for local dev) and in the `backend/` directory:

```env
# Django Secrets
DJANGO_SECRET_KEY=your-super-secret-key
DEBUG=True

# Database Configuration (Supabase Connection Pooling URL)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# Supabase Storage Configuration
AWS_ACCESS_KEY_ID=your_supabase_s3_access_key
AWS_SECRET_ACCESS_KEY=your_supabase_s3_secret_key
AWS_STORAGE_BUCKET_NAME=profile-assets
AWS_S3_ENDPOINT_URL=https://<PROJECT_REF>.supabase.co/storage/v1/s3

# API Security
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
```

---

## 🚢 Deployment

This platform is configured for zero-config deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. The `vercel.json` configuration will automatically route `npm run build` to output the frontend static files.
3. The serverless functions configured in `vercel.json` (`api/**/*.py`) will build the Django WSGI backend automatically using the Python runtime.
4. Add all environment variables listed above into your Vercel Project Settings.
5. Use a free external scheduler to ping the `/__readyz` or `/__healthz` endpoint once per day and keep Supabase active.

---

## GitHub Actions Keep-Alive

This repository includes a GitHub Actions workflow at `.github/workflows/keep-alive.yml` that runs daily and pings `https://www.bigendra.com.np/__readyz`.

To enable it on GitHub:

1. Push this branch to your repository.
2. Open your repo on GitHub and go to `Actions`.
3. Select the `Supabase Keep-Alive` workflow from the list.
4. Confirm the workflow is enabled and check the run history.

---

## 🛡️ Security Notes

- **API Hardening:** Testimonial endpoints are actively rate-limited and secured against automated bot spam via hidden honeypot validation fields.
- **Admin Access:** Registration is disabled (`AUTH_ALLOW_PUBLIC_REGISTRATION=False`). Django session auth secures the CMS, while SimpleJWT handles internal API requests.
- **CORS & CSRF:** Strict CORS regex rules are applied. Production uses `Lax` SameSite cookies and enforces `HTTPS`.
- **Secrets Management:** All API keys, DB strings, and storage endpoints must be securely stored in Vercel. Never commit `.env`.

---

## 🧪 Testing

```bash
# Run Django Unit Tests
python manage.py test backend/apps

# Run TypeScript Linter
npm run lint
```

---

## ⚙️ Maintenance Guide

- **Database Health:** Vercel automatically pings the backend every 10 minutes via cron to keep the Supabase database instance active.
- **Storage:** If you encounter broken images, ensure `AWS_S3_ENDPOINT_URL` and S3 credentials in Supabase Storage match your `.env`. Supabase buckets must be marked as **Public**.
- **Performance Adjustments:** Caching timers for the read-heavy endpoints (e.g., `/api/skills/`) can be modified via `@cache_page` in `backend/apps/core/api.py` if traffic scales significantly.

---
*Maintained by Bigendra Shrestha.*
