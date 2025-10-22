# Green Protocol

Green Protocol is a Next.js (TypeScript) application that rewards recycling actions with "GSEED" and lets users convert them to PYUSD. It uses reusable UI components and Supabase for persistence.

## Status
- Next.js 13 (app router)
- Tailwind CSS + shadcn-style components
- Supabase integration (client and types in lib/supabase.ts)

## Main features
- Create wallet and generate QR (components/create-wallet.tsx)
- User dashboard with balances and metrics (components/wallet-dashboard.tsx)
- Deposit materials to earn GSEED (components/deposit-interface.tsx)
- Swap GSEED → PYUSD (components/swap-interface.tsx)
- Transaction history (components/transaction-history.tsx)

## Requirements
- Node.js v18+ recommended
- Environment variables in `.env`:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

## Install & development
```bash
npm install
npm run dev
```

## Build & run
```bash
npm run build
npm start
```

## Database / Migrations
Migrations are in:
- supabase/migrations/20251021230657_create_green_protocol_schema.sql

Use the Supabase CLI to apply migrations if needed.

## Key files
- lib/supabase.ts — Supabase client and types (includes Wallet type)
- lib/wallet.ts — business logic (GSEED_TO_PYUSD_RATE, swapGSEEDtoPYUSD)
- app/page.tsx — app entry
- components/* — UI components (create-wallet, wallet-dashboard, deposit-interface, swap-interface, transaction-history)
- components/ui — reusable UI primitives

## Conversion rate
Default rate:
1 GSEED = 0.5 PYUSD
Change GSEED_TO_PYUSD_RATE in lib/wallet.ts to adjust.

## Notes
- Uses path aliases (`@/*`) from tsconfig.json
- Edit UI components under components/ui
- Adjust material types via the migration SQL or the material_types table

## Useful scripts
- dev: `npm run dev`
- build: `npm run build`
- start: `npm start`
- typecheck: `npm run typecheck`
- lint: `npm run lint`