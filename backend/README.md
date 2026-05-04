# Hope Foundation API

Laravel REST API backend for the Hope Foundation platform, supporting donor/volunteer experiences, organization administration, and platform moderation.

## Requirements

- PHP 8.2+
- Composer
- SQLite/MySQL/PostgreSQL
- Node (optional for frontend tooling)

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

## Docker Deployment (Koyeb)

This project ships with a `Dockerfile` that runs Nginx + PHP-FPM and listens on the `PORT`
environment variable (defaults to `8080`). Render-specific deployment configuration has been
removed in favor of Docker-based Koyeb deployment.

### Build & Run Locally

```bash
docker build -t cvp-backend .
docker run --rm -p 8080:8080 \
  -e APP_KEY=base64:yourkey \
  -e APP_URL=http://localhost:8080 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e STRIPE_PUBLIC_KEY=pk_test_... \
  -e STRIPE_SECRET_KEY=sk_test_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  cvp-backend
```

### Deploy on Koyeb

1. Create a new **Docker** app in Koyeb and point it to this repository.
2. Koyeb will build the image from the `Dockerfile`.
3. Configure the following environment variables in Koyeb:
   - `APP_KEY`
   - `APP_URL`
   - `DATABASE_URL`
   - `STRIPE_PUBLIC_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Ensure the service port is set to `8080` (or provide a `PORT` env var).

## Environment Variables

```bash
APP_URL=http://localhost
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=USD
```

## Stripe Webhook

Create a Stripe webhook pointing to:

```
POST {APP_URL}/api/v1/stripe/webhook
```

Listen for at least:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## Authentication

The API uses Laravel Sanctum API tokens. Use `/api/v1/auth/register` or `/api/v1/auth/login` to obtain a token.
Send the token in the `Authorization` header:

```
Authorization: Bearer {token}
```

## Example API Calls

Create a donation intent:

```bash
curl -X POST "${APP_URL}/api/v1/donations/intent" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"amount_cents": 2500, "currency": "USD"}'
```

Create an organization:

```bash
curl -X POST "${APP_URL}/api/v1/orgs" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hope Org", "slug": "hope-org"}'
```

## API Reference

See `docs/api.md` for the frontend integration reference.

## Testing

```bash
php artisan test
```
