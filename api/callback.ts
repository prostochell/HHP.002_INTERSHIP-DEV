// /api/callback.ts
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { code, state } = req.query;
  console.log('callback state=%s code=%s', state, code);

  if (!code || !state) return res.status(400).send('missing');

  // одноразово, з TTL 5 хв
  await kv.set(String(state), String(code), { ex: 300 });

  // будь-яка ваша відповідь/редирект
  return res.status(200).send('OK');
}
