# The Bridge to "I" — architecture map with an editable swim lane

A single-page map of Dinesh's coaching flow. The swim lane on every module tab
has **10 lanes**:

**CLIENT · COACH · CAA · CCA · COS · CIT · CGA · NOTION · BOT · AUTOMATION**

On any module tab you can **add a message into any swim-lane cell**: hover an
empty cell, click the **＋**, type, and **Save**. The note shows as a small card
in that lane, on that step's row (e.g. a note in the CIT lane next to Step 1).
Click a saved note to edit or delete it.

## Where notes are stored (important)

Notes save through `/api/prompts` (a Vercel serverless function). Storage has
two modes, shown by the pill in the **"✎ Editable swim lane"** bar on each tab:

- **THIS DEVICE** — no cloud store connected yet, so notes are kept only in the
  current browser (localStorage). They are **not** shared with other people.
- **SHARED · cloud** — a Vercel KV store is connected, so notes are saved
  server-side and **everyone who opens the page sees them**.

To get shared storage for everyone, do the one-time setup below.

## Deploy on Vercel

1. Import this repo in Vercel → **Deploy** (no build step; static page + `api/`).

The site works immediately in **THIS DEVICE** mode.

## Turn on shared storage for everyone (~2 min) — required for "everyone sees it"

1. Vercel project → **Storage** → **Create Database** → **KV** (Upstash Redis) →
   connect it to this project.
2. Vercel auto-adds env vars `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. **Redeploy**.

`api/prompts.js` detects those env vars automatically. Once present, the pill
flips to **SHARED · cloud** and notes persist for all visitors. No code change.

## Local development

```bash
npm install
npx vercel dev
```

Without KV env vars, the API returns `configured: false` and the page runs in
**THIS DEVICE** mode — same graceful fallback as production.

## Files

- `index.html` — the whole page. Swim-lane note logic is in the inline `<script>`
  (`ensureNotes` / `saveNote` / `makeNoteCell`). Notes are keyed
  `tab::step::lane`.
- `api/prompts.js` — `GET` returns all saved notes; `POST {key,value}` saves one
  (empty value deletes).
- `vercel.json`, `package.json` — Vercel config + the single `@vercel/kv` dep.
