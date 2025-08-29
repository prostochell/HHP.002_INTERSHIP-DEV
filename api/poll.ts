// /api/poll.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { state } = req.query
  if (!state) return res.status(400).send('missing state')

  const code = await kv.getdel(String(state))
  if (!code) return res.status(204).end()

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send(String(code))
}
