# Vercel Deployment Guide

This project is configured to be deployed as a full-stack application on Vercel (React Frontend + Django Serverless Backend).

## Steps to Deploy

1. **Push to GitHub**: Make sure all your latest code is pushed to your GitHub repository.
2. **Import Project**: Log into [Vercel](https://vercel.com/) and click "Add New" > "Project". Import your GitHub repository.
3. **Configure Settings**:
   - Vercel should automatically detect the Framework as **Vite**.
   - The Root Directory should remain blank (default).
4. **Environment Variables**:
   Before clicking deploy, expand the "Environment Variables" section and add the following keys.

### Required Environment Variables

#### Django Core
- `DJANGO_SECRET_KEY`: Create a long, secure random string (e.g., `my-super-secret-key-12345`).
- `DEBUG`: Set to `False`.
- `ALLOWED_HOSTS`: Set to `*` or your specific `.vercel.app` domain.

#### Supabase Database
- `DATABASE_URL`: Your Supabase connection string (Transaction mode string from your Supabase Dashboard).

#### Supabase Storage (S3 for Media Uploads)
- `AWS_ACCESS_KEY_ID`: Your Supabase S3 Access Key.
- `AWS_SECRET_ACCESS_KEY`: Your Supabase S3 Secret Key.
- `AWS_STORAGE_BUCKET_NAME`: The name of the bucket you created in Supabase Storage (e.g., `portfolio-assets`).
- `AWS_S3_ENDPOINT_URL`: The S3 Endpoint URL provided in your Supabase Storage settings.
- `AWS_S3_REGION_NAME`: Set to `auto` (or your specific Supabase region).

5. **Deploy**: Click the Deploy button. Vercel will build the React app, install the Python dependencies from `requirements.txt`, and automatically map the `/api/` and `/admin/` routes to your Django serverless function.

## Post-Deployment
- Vercel will run the database migrations automatically, but you will need to create a superuser for the Django admin.
- You can create a superuser locally by connecting to your remote Supabase database and running `python manage.py createsuperuser`, or by creating a temporary Python script/view on Vercel to generate one.
