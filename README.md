# Murali Krishna Kolipaka — Portfolio

Cinematic 3D scroll-driven portfolio. Next.js 14 · TypeScript · Tailwind ·
Three.js · GSAP + ScrollTrigger · Lenis · Framer Motion · Supabase.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## One-time Supabase setup

1. Open the Supabase dashboard → SQL editor.
2. Paste and run `supabase/schema.sql` (creates all tables, RLS policies, seed data).
3. Dashboard → Authentication → Users → **Add user** — create your admin
   email + password (this is your `/admin` login).

Until this is done the portfolio still works fully — it renders from the
in-code defaults in `src/lib/defaultContent.ts`. Once the schema is run,
everything you edit at `/admin` overrides those defaults instantly.

## Assets to drop in

| File | Purpose |
|---|---|
| `public/photo/murali.jpg` | Contact-section portrait (circular, golden ring) |
| `public/video/clip-1-storm.mp4` | Hero background (Higgsfield Clip 1) |
| `public/video/clip-2-architect.mp4` | Architecture section background |
| `public/video/clip-3-builder.mp4` | Tools section background |
| `public/video/clip-4-closer.mp4` | Films/contact background |
| `public/og/og-image.png` | 1200×630 social share image |
| `public/murali-krishna-resume.pdf` | Resume download |

The design never depends on these — every section renders correctly
without them. They enrich, they don't carry.

## Admin panel

`/admin` — Supabase-Auth protected. Sections: Dashboard, Identity, Numbers,
Cases, Tools, Films, Work, Copy, Theme, Scenes. Auto-save (800 ms debounce),
visibility toggles, up/down reorder, delete-with-confirmation.

## Deploy

Push to GitHub → import in Vercel → set env vars
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
