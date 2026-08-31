# The Bridge to "I" — architecture map + agent prompt boxes

A single-page map of Dinesh's coaching flow, plus an **Agents** tab where you can
type and **store** a system prompt / note for each agent:

- **CAA** — Coach-Assist Agent
- **CCA** — Client's Companion Agent
- **COS** — Coach Ops / Scheduling
- **CIT** — Coach-in-Training / QA
- **CGA** — Consent / Gate Agent
- **AUTO** — Automation
- **BOT** — Bot

Each box's text acts as that agent's standing instruction (a "comment") and is saved.

## Deploy on Vercel

1. Push this repo to GitHub (already done on the working branch).
2. In Vercel → **Add New… → Project** → import this repo → **Deploy**.
   No build step is needed — it's a static page plus one serverless function
   in `api/`.

That's it — the site works immediately. Out of the box, prompts are saved in the
visitor's **own browser** (localStorage): nothing is lost, but they don't sync
across devices or people.

## Turn on shared cloud storage (optional, ~2 min)

To make saved prompts persist server-side and be shared by everyone who opens
the page, connect a KV store:

1. Vercel project → **Storage** → **Create Database** → **KV** (Upstash Redis) →
   connect it to this project.
2. Vercel auto-adds the env vars `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. **Redeploy**.

The `api/prompts.js` function detects those env vars automatically. When present,
it reads/writes the shared store and the page shows **"saved to the cloud"**;
when absent, it reports `configured: false` and the page falls back to
localStorage and shows **"saved on this device"**. No code change needed either way.

## Local development

```bash
npm install
npx vercel dev
```

Without KV env vars set locally, the API returns `configured: false` and the page
uses localStorage — same graceful fallback as production.

## Files

- `index.html` — the whole page (map + Agents tab). Storage logic lives in the
  inline `<script>` (`loadPrompts` / `savePrompt`).
- `api/prompts.js` — `GET` returns all stored prompts; `POST {key,value}` saves one.
- `vercel.json`, `package.json` — Vercel config and the single `@vercel/kv` dependency.
