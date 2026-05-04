# Deploy to Koyeb (Laravel + PostgreSQL)

This guide shows how to deploy this Laravel app to **Koyeb** using the **Dockerfile** builder and a **Neon PostgreSQL** database.

## 1) Prepare your app key locally

Generate a production app key (do not commit this value):

```bash
php artisan key:generate --show
```

Copy the `base64:...` output for the `APP_KEY` environment variable.

## 2) Create the Koyeb Web Service

1. **Koyeb Dashboard → Create Web Service**
2. Select your **GitHub repository**
3. **Builder:** Dockerfile
4. **Exposed port:** `8000` (HTTP)

## 3) Configure environment variables

Add these environment variables in Koyeb:

```text
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:... (from `php artisan key:generate --show`)
APP_URL=https://<your-app>.koyeb.app
LOG_CHANNEL=stderr
RUN_MIGRATIONS=true (only for first deploy; then set to false)

DB_CONNECTION=pgsql
DB_HOST=<from Neon host>
DB_PORT=5432
DB_DATABASE=<db name>
DB_USERNAME=<user>
DB_PASSWORD=<password>
DB_SSLMODE=require (optional, recommended)
```

Notes:
- Neon provides standard Postgres connection parameters and connection strings.
- You can also set `DATABASE_URL` (or `DB_URL`) instead of the individual `DB_*` variables.
- **Do not** hardcode secrets in the repository.

## 4) First deploy migrations

The container runs migrations **only** when `RUN_MIGRATIONS=true`. After the first deploy succeeds, set it back to `false` to avoid accidental repeated migrations.

## 5) Filesystem considerations

Koyeb instances have an **ephemeral filesystem**. If your application accepts uploads, use external object storage (e.g., S3, Cloudinary) instead of local disk storage.
