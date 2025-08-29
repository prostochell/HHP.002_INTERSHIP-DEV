import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const envOk = Boolean(
      process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_REDIRECT_URI &&
      process.env.KV_REST_API_URL &&
      process.env.KV_REST_API_TOKEN
    )

    // Перевірка RW доступу до KV (одноразовий ключ з TTL)
    const key = `__health:${Math.random().toString(36).slice(2)}`
    await kv.set(key, 'ok', { ex: 30 })
    const val = await kv.getdel<string>(key)
    const kvOk = val === 'ok'

    res.status(200).json({ ok: envOk && kvOk, envOk, kvOk })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message ?? e) })
  }
}
