// Vercel Node Function
const URL   = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export default async function handler(req, res) {
  const { code, state, error } = req.query || {};
  if (error) return res.status(400).send(`<!doctype html><meta charset="utf-8"><h3>Spotify error</h3><pre>${error}</pre>`);
  if (!code || !state) return res.status(400).send(`<!doctype html><meta charset="utf-8"><h3>Missing code/state</h3>`);

  try {
    const r = await fetch(`${URL}/set/${encodeURIComponent('sp:'+state)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: code, ex: 120 }) // 120s TTL
    });
    if (!r.ok) throw new Error(`KV set failed: ${r.status}`);

    res.status(200).send(`<!doctype html><meta charset="utf-8">
      <style>body{font-family:system-ui;background:#0f172a;color:#e5e7eb;padding:24px}</style>
      <h2>✅ Авторизація пройшла</h2>
      <p>Можеш повернутись до пристрою. Він завершить налаштування автоматично.</p>`);
  } catch (e) {
    res.status(500).send(`<!doctype html><meta charset="utf-8"><h3>KV error</h3><pre>${String(e)}</pre>`);
  }
}
