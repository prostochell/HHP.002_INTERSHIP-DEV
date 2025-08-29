// /api/poll.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_URL = process.env.KV_REST_API_URL!;
const KV_TOKEN = process.env.KV_REST_API_TOKEN!;

async function kvGetDel(key: string) {
  // беремо і видаляємо, щоб код не використали двічі
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!r.ok) return null;
  const { result } = await r.json();
  if (!result) return null;
  await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  return result as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const state = (req.query.state as string | undefined) || '';
  if (!state) return res.status(400).json({ error: 'missing state' });

  const code = await kvGetDel(`sp:${state}`);
  if (!code) return res.status(204).end(); // немає ще

  res.status(200).json({ code });
}
