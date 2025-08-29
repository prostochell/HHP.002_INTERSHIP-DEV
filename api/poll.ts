// /api/poll.ts
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { state } = req.query;
  console.log('poll state=%s', state);

  if (!state) return res.status(400).send('missing state');

  const code = await kv.getdel(String(state)); // одноразове читання
  if (!code) return res.status(204).end();     // <-- те, що ти бачиш зараз

  return res.status(200).json({ code });
}
