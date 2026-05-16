# Shelly's Golden Glam 50th

A single-page RSVP site for Shelly's 50th birthday celebration — Bend & Sunriver,
Oregon, June 9–15, 2026.

Guests can:

- RSVP with per-event checkboxes across the seven-day schedule
- Record a video birthday message in the browser, or upload one from their phone
- Upload favorite photos of Shelly through the years for a slideshow

Built with Vite + React + TypeScript + Tailwind + shadcn UI primitives, backed
by Supabase (Postgres + Storage).

## Setup

### 1. Install dependencies

```sh
npm install
```

### 2. Create a Supabase project

Sign in at [supabase.com](https://supabase.com), create a new project, and grab
the **Project URL** and **anon/public** API key from
**Project Settings → API**.

### 3. Configure environment

```sh
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
```

### 4. Apply the database migration

In the Supabase dashboard → **SQL Editor**, run the contents of
`supabase/migrations/20260516023729_shelly_birthday_rsvp.sql`.

This creates:

- `shelly_rsvps` — RSVP submissions
- `shelly_video_messages` — video birthday messages
- `shelly_photos` — uploaded photo memories
- Two public Storage buckets: `shelly-videos` and `shelly-photos`
- RLS policies that allow anonymous **inserts** but **not reads** of submission
  rows. (Storage objects are publicly readable so videos/photos can be shown
  back later.)

Alternatively, with the Supabase CLI:

```sh
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

### 5. Run locally

```sh
npm run dev
```

Open http://localhost:8080.

### 6. Build for production

```sh
npm run build
```

Outputs static files to `dist/`. Deploy anywhere that hosts static sites —
Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, etc.

## Viewing submissions

Go to the Supabase dashboard:

- **Table Editor → shelly_rsvps** — RSVPs, with each event under the
  `attendance` JSON column (event id → true)
- **Table Editor → shelly_video_messages** — video messages
  (download from Storage → shelly-videos using the `storage_path` value)
- **Table Editor → shelly_photos** — photo uploads with optional captions and
  years (download from Storage → shelly-photos)

## Customizing

- **Schedule:** `src/pages/shelly/schedule.ts` — edit days, events, times,
  notes. Each event needs a stable `id`; RSVP attendance is keyed by these.
- **Theme:** `src/index.css` — CSS variables for the gold/onyx palette.
- **Copy:** Hero, schedule, and section headers live in the matching files
  under `src/pages/shelly/sections/`.

## License

Private project — for Shelly. 🎉
