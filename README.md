# Cursor Companion Backend 💕

Backend + phone web app for **Cursor Pals / Pal Link**: boops, pal visits, live doodles, voice notes, presence (online / busy) and a flower you grow together every day.

## Deploy (Vercel)

1. Import this repo in Vercel (no framework, no build step).
2. Add **Upstash Redis** from the Vercel Marketplace (Storage → Upstash → Redis) and connect it to the project.
   It sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `_TOKEN`), both work.
3. Optional: `PLANT_TZ_OFFSET_MIN` = minutes from UTC for when a garden day starts (default `330`, IST).
4. Deploy. The phone app is at the root URL; open it on the phone and **Add to Home Screen**.

The Mac app's default server is `https://cursor-companion-backend.vercel.app`. If your URL differs, set it in Cursor Pals → Settings → Pal Link → Advanced.

## Connect

Every install gets a 6-character code. Either person enters the other's code and you're paired.
Re-pairing the same two people brings their garden back.

## Local dev

```bash
node dev.js   # http://localhost:3000, in-memory store unless the KV env vars are set
```

## API

| Route | What |
|---|---|
| `GET/POST /api/link` | identity, codes, pair / unpair |
| `GET /api/poll` | drain inbox (held while busy), presence |
| `POST /api/send` | boop, visit, scribble, hug, voice |
| `POST /api/bye` | mark offline now |
| `GET/POST /api/plant` | today's flower: pick, water, garden |
