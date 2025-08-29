// /api/callback.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_URL = process.env.KV_REST_API_URL!;
const KV_TOKEN = process.env.KV_REST_API_TOKEN!;

async function kvSet(key: string, value: string, ttlSec: number) {
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, ex: ttlSec })
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error } = req.query as Record<string, string | undefined>;

  if (error) {
    return res.status(400).send(`<meta charset="utf-8"><h3>Spotify error</h3><pre>${error}</pre>`);
  }
  if (!code || !state) {
    return res.status(400).send(`<meta charset="utf-8"><h3>Missing code/state</h3>`);
  }

  try {
    await kvSet(`sp:${state}`, code, 120); // живе 2 хв
    res.status(200).send(
      `<!doctype html><meta charset="utf-8">
       <style>body{font-family:system-ui;background:#0f172a;color:#e5e7eb;padding:24px}</style>
       <h2>✅ Авторизація пройшла</h2>
       <p>Можеш повернутись до пристрою. Він завершить налаштування автоматично.</p>`
    );
  } catch (e) {
    res.status(500).send(`<meta charset="utf-8"><h3>KV error</h3><pre>${String(e)}</pre>`);
  }
}
