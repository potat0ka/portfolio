# Supabase Configuration Guide

This project uses [Supabase](https://supabase.com/) as its primary Database (PostgreSQL) and Media Storage (S3).

## 1. Database Setup
1. Create a new project in the Supabase Dashboard.
2. Go to **Settings > Database**.
3. Scroll down to **Connection String** and select the `URI` format.
4. Make sure "Use connection pooling" (Transaction mode) is checked if you are deploying to Vercel.
5. Copy this string. It will look like `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`.
6. Add this to Vercel as your `DATABASE_URL`.

## 2. Storage Setup (For CVs and Profile Photos)
Because Vercel is serverless, any files uploaded in the Django Admin will be deleted immediately. To fix this, the app uses `django-storages` to save uploaded files directly into Supabase Storage.

1. Go to **Storage** in the Supabase Dashboard.
2. Create a new bucket. Name it something like `portfolio-assets`. **Make sure to mark the bucket as PUBLIC** so images can be viewed on your site.
3. Go to **Settings > Storage**.
4. Scroll down to the **S3 Connection** section. Here you will find:
   - Your S3 Endpoint URL (e.g., `https://[ref].supabase.co/storage/v1/s3`)
   - Your Region (e.g., `eu-central-1`)
5. You need Access Keys to authenticate. Under S3 Access Keys, click **New Access Key**.
   - Copy the `Access Key ID`.
   - Copy the `Secret Access Key`.

## 3. Connect the Dots
Take all those values and put them into Vercel's Environment Variables:
- `AWS_ACCESS_KEY_ID`: [Your Access Key]
- `AWS_SECRET_ACCESS_KEY`: [Your Secret Key]
- `AWS_STORAGE_BUCKET_NAME`: `portfolio-assets` (or whatever you named your bucket)
- `AWS_S3_ENDPOINT_URL`: [Your S3 Endpoint URL]
- `AWS_S3_REGION_NAME`: `auto` (or the specific region listed in Supabase)

Now, anytime you use the Django Admin to upload a CV or a photo, it will safely store it inside Supabase!

## 4. Keeping Supabase Alive
Supabase automatically pauses free projects if they are inactive for 7 days.
On Vercel Free, you cannot rely on built-in server cron jobs for this path. Instead, use a free external scheduler such as UptimeRobot, cron-job.org, or GitHub Actions to ping your `/__readyz` endpoint once a day. That request will exercise the Django app and keep your Supabase project from falling asleep.
