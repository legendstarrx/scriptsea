# ScriptSea

ScriptSea is a Next.js app for generating social video scripts, thumbnail ideas, and SEO content.

## Quick Start

1. Install dependencies with `npm install`.
2. Copy `.env.local.example` to `.env.local`.
3. Run the app with `npm run dev`.
4. Open `http://localhost:3000`.

## Environment Variables

Set the following in `.env.local`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional; default: `gpt-4.1-mini`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for server-side admin operations)
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`
- `POLAR_PRODUCT_WEEKLY_ID`
- `POLAR_PRODUCT_MONTHLY_ID`
- `NEXT_PUBLIC_BASE_URL` (production domain, e.g. `https://scriptsea.com`)

## Supabase Setup

1. Open Supabase SQL Editor.
2. Run `supabase/001_initial_schema.sql`.
3. Enable email auth in Supabase Auth settings.
4. Optionally configure Google OAuth in Supabase for social sign-in.

## OpenAI + Polar Setup

Frontend generation now goes through `POST /api/ai/generate`, which calls OpenAI server-side.
Keep OpenAI API keys in server-side env only.
Billing now goes through Polar checkout via `POST /api/create-payment` and webhook updates at `POST /api/webhooks/polar`.
