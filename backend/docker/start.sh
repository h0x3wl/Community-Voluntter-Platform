#!/usr/bin/env sh
set -e

: "${PORT:=8000}"
: "${CACHE_STORE:=file}"
: "${CACHE_DRIVER:=file}"

export CACHE_STORE
export CACHE_DRIVER

# Don't auto-generate keys on every boot (will break sessions/encryption)
if [ -z "${APP_KEY:-}" ]; then
  echo "ERROR: APP_KEY is missing. Generate locally: php artisan key:generate --show" >&2
  exit 1
fi

# Optional: create storage link (ok if it already exists)
php artisan storage:link >/dev/null 2>&1 || true

# Ensure framework cache directories exist before caching commands
mkdir -p storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs

# Run package discovery at runtime (since build used --no-scripts)
php artisan package:discover --ansi || true

# Cache (safe)
php artisan config:cache || true
php artisan route:cache  || true
php artisan view:cache   || true

# Run migrations only if you enable it
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  DB_HOST="${DB_HOST_MIGRATIONS:-$DB_HOST}" \
  DB_PORT="${DB_PORT_MIGRATIONS:-$DB_PORT}" \
  DB_DATABASE="${DB_DATABASE_MIGRATIONS:-$DB_DATABASE}" \
  DB_USERNAME="${DB_USERNAME_MIGRATIONS:-$DB_USERNAME}" \
  DB_PASSWORD="${DB_PASSWORD_MIGRATIONS:-$DB_PASSWORD}" \
  DB_SSLMODE="${DB_SSLMODE_MIGRATIONS:-$DB_SSLMODE}" \
  php artisan migrate --force --isolated

fi

# Optionally seed data
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  DB_PORT="${DB_PORT_MIGRATIONS:-$DB_PORT}" \
  DB_DATABASE="${DB_DATABASE_MIGRATIONS:-$DB_DATABASE}" \
  DB_USERNAME="${DB_USERNAME_MIGRATIONS:-$DB_USERNAME}" \
  DB_PASSWORD="${DB_PASSWORD_MIGRATIONS:-$DB_PASSWORD}" \
  DB_SSLMODE="${DB_SSLMODE_MIGRATIONS:-$DB_SSLMODE}" \
  php artisan db:seed --force -v
fi


exec php -S 0.0.0.0:${PORT} -t public
