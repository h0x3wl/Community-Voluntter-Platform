#!/bin/sh
set -e

: "${PORT:=8080}"
: "${CACHE_STORE:=file}"
: "${CACHE_DRIVER:=file}"

export CACHE_STORE
export CACHE_DRIVER


envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

mkdir -p storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs

php artisan config:cache
php artisan route:cache
DB_HOST="${DB_HOST_MIGRATIONS:-$DB_HOST}" \
DB_PORT="${DB_PORT_MIGRATIONS:-$DB_PORT}" \
DB_DATABASE="${DB_DATABASE_MIGRATIONS:-$DB_DATABASE}" \
DB_USERNAME="${DB_USERNAME_MIGRATIONS:-$DB_USERNAME}" \
DB_PASSWORD="${DB_PASSWORD_MIGRATIONS:-$DB_PASSWORD}" \
DB_SSLMODE="${DB_SSLMODE_MIGRATIONS:-$DB_SSLMODE}" \
php artisan migrate --force --isolated

php-fpm -D
exec nginx -g 'daemon off;'
