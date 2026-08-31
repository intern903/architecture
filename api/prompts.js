// Vercel Serverless Function — stores the agent prompt boxes.
//
// Storage: Vercel KV (Upstash Redis). It is OPTIONAL. If no KV store is
// connected, the API responds with { configured: false } and the page
// silently falls back to per-browser localStorage — so the site works the
// moment it deploys, and gains cross-device cloud storage once you connect
// a KV store (see README.md).
//
// Everything lives under one key so a GET returns the whole set at once.

const KEY = 'agent_prompts';

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function readBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  // No KV connected → tell the client to use its local fallback.
  if (!kvConfigured()) {
    if (req.method === 'GET') return res.status(200).json({ configured: false, prompts: {} });
    if (req.method === 'POST') return res.status(200).json({ configured: false, ok: false });
    return res.status(405).json({ configured: false, error: 'method not allowed' });
  }

  let kv;
  try {
    ({ kv } = require('@vercel/kv'));
  } catch (e) {
    return res.status(200).json({ configured: false, prompts: {}, error: 'kv module unavailable' });
  }

  try {
    if (req.method === 'GET') {
      const prompts = (await kv.get(KEY)) || {};
      return res.status(200).json({ configured: true, prompts });
    }

    if (req.method === 'POST') {
      const { key, value } = await readBody(req);
      if (typeof key !== 'string' || !key) {
        return res.status(400).json({ configured: true, ok: false, error: 'missing key' });
      }
      if (typeof value !== 'string') {
        return res.status(400).json({ configured: true, ok: false, error: 'value must be a string' });
      }
      if (value.length > 20000) {
        return res.status(413).json({ configured: true, ok: false, error: 'value too large' });
      }
      const prompts = (await kv.get(KEY)) || {};
      prompts[key] = { value, updated: Date.now() };
      await kv.set(KEY, prompts);
      return res.status(200).json({ configured: true, ok: true, prompts });
    }

    return res.status(405).json({ configured: true, error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ configured: true, ok: false, error: String(e && e.message || e) });
  }
};
