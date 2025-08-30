// api/callback.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const code  = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;

  if (!code) {
    return res.status(400).send('Missing code');
  }

  // ⚠️ ПІДСТАВ СВІЙ IP ESP (або заведи ENV ESP_HOST у Vercel)
  const espHost = process.env.ESP_HOST || 'http://192.168.9.50';

  const url = `${espHost}/callback?code=${encodeURIComponent(code)}${
    state ? `&state=${encodeURIComponent(state)}` : ''
  }`;

  res.setHeader('Location', url);
  res.status(302).end();
}
