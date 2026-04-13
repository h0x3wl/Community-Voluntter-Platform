# syntax=docker/dockerfile:1
FROM php:8.2-cli-alpine

RUN apk add --no-cache \
      bash curl git unzip \
      icu-libs libpq libzip oniguruma \
    && apk add --no-cache --virtual .build-deps \
      $PHPIZE_DEPS icu-dev postgresql-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install -j$(nproc) \
      pdo_pgsql intl mbstring zip opcache \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

COPY . .

# Copy + chmod start script AS ROOT (important)
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod 755 /usr/local/bin/start.sh

# Create non-root user & fix perms
RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p storage/framework/cache/data \
      storage/framework/sessions \
      storage/framework/views \
      storage/logs \
      bootstrap/cache \
    && chown -R app:app /app

USER app

EXPOSE 8000
CMD ["sh", "/usr/local/bin/start.sh"]
