# AI Trade Navigator

AI Trade Navigator is a TanStack Start + Vite SaaS frontend with a lightweight SSR worker layer for health checks, protected admin APIs, billing mock support, demo auth, and operational dashboards.

## Stack

- TanStack Start
- TanStack Router
- React 19
- TypeScript
- Vite
- Cloudflare Worker-compatible server entry
- Tailwind CSS 4

## Frontend Structure

```text
src/
  components/
    trading/        # landing, dashboard, scanner and trading-focused UI
    ui/             # reusable Radix-style primitives
  hooks/            # API and utility hooks
  lib/
    app-config.ts   # public runtime config for frontend
    client-api.ts   # browser fetch wrapper
    trading-intelligence.ts
    server/         # server-only auth, plans, billing, health and API helpers
  routes/           # file-based TanStack routes
  router.tsx
  server.ts         # worker/SSR entry with API interception and security headers
  start.ts
  styles.css
```

## New Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- `APP_NAME`
- `APP_DOMAIN`
- `PUBLIC_URL`
- `ENVIRONMENT`
- `APP_VERSION`
- `CORS_ORIGINS`
- `PAYMENT_PROVIDER`
- `SESSION_SECRET`
- `QUANT_BRIDGE_ENABLED`
- `QUANT_API_BASE_URL`
- `QUANT_GOD_URL`
- `QUANT_API_TIMEOUT_MS`
- `DEMO_AUTH_ENABLED`
- `DEMO_ADMIN_EMAIL`
- `DEMO_ADMIN_PASSWORD`
- `DEMO_ADMIN_NAME`
- `DEMO_USER_EMAIL`
- `DEMO_USER_PASSWORD`
- `DEMO_USER_NAME`
- `DEMO_USER_PLAN`

Optional build-time mirrors for route metadata:

- `VITE_APP_NAME`
- `VITE_APP_DOMAIN`
- `VITE_PUBLIC_URL`
- `VITE_ENVIRONMENT`
- `VITE_APP_VERSION`

## Development

```bash
npm install --no-package-lock
npm run dev
```

## Build

```bash
npm run build
```

## Production (Node / VPS)

This project can run safely behind Nginx on a Node server using Vite's preview server.
It is a good isolated deployment option for a frontend-first SaaS while we keep the rest
of your infrastructure untouched.

```bash
npm install --no-package-lock
npm run build
PORT=3020 npm run start
```

Health endpoints remain available in production:

- `/health`
- `/api/health`
- `/api/quant/health`
- `/api/quant/status`
- `/api/quant/operation`

## Smoke Test

```bash
BASE_URL=http://localhost:3000 ./scripts/smoke_saas.sh
```

The smoke script checks:

- `/`
- `/health`
- `/api/health`
- `/login`
- `/dashboard`
- `/scanner`
- `/sinais`
- `/noticias`
- `/backtest`
- `/estrategias`
- `/api/plans`
- `/api/billing/status`
- `/api/quant/health`
- `/api/quant/status`
- `/api/quant/operation`
- `/api/admin/system-status` must be `401` or `403` without login

## Billing Mock

Keep `PAYMENT_PROVIDER=mock` to expose safe plan and billing responses without real payment credentials.

## Deploy Checklist

1. Copy `.env.example` into deployment environment and set production values.
2. Keep `SESSION_SECRET` unique in production.
3. Set `DEMO_AUTH_ENABLED=false` unless you intentionally want demo login.
4. Point the Quant bridge to the live ApexQuant engine:
   - `QUANT_BRIDGE_ENABLED=true`
   - `QUANT_API_BASE_URL=https://trade.apexgol.com.br`
   - `QUANT_GOD_URL=https://quant.apexgol.com.br`
5. Run `npm install --no-package-lock`.
6. Run `npm run build`.
7. Start the Node server with `PORT=3020 npm run start`.
8. Run `BASE_URL=https://your-domain ./scripts/smoke_saas.sh`.
9. Confirm:
   - `/health`
   - `/api/health`
   - `/api/quant/status`
   - `/api/plans`
   - `/api/billing/status`
   - `/api/admin/system-status`

## Notes

- Existing public routes remain available.
- The Navigator can mirror the ApexQuant engine through the internal bridge endpoints under `/api/quant/*`.
- Telegram sending remains handled by the ApexQuant backend; the Navigator only triggers safe proxy actions such as scanner run-once and Telegram test.
- Admin pages are server-protected and redirect to `/login` when no session is present.
- Billing is mock-safe by default.
- Trading insights include:
  - `confidence_score`
  - `risk_level`
  - `rationale`
  - `recommended_action`
  - disclaimer: `Análise informativa. Não é garantia de lucro.`
