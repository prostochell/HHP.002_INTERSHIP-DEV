const URL   = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export default async function handler(req, res) {
  const state = (req.query?.state || '').toString();
  if (!state) return res.status(400).json({ error: 'missing state' });

  // get
  const g = await fetch(`${URL}/get/${encodeURIComponent('sp:'+state)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  if (!g.ok) return res.status(500).json({ error: 'kv get failed' });
  const { result } = await g.json();
  if (!result) return res.status(204).end(); // ще нема

  // del (одноразово)
  await fetch(`${URL}/del/${encodeURIComponent('sp:'+state)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  res.status(200).json({ code: String(result) });
}
