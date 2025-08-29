// pages/api/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";

function b64urlToStr(b64: string) {
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64").toString("utf8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  if (!code || !state) return res.status(400).send("missing");

  let ip = "", port = 80;
  try {
    const parsed = JSON.parse(b64urlToStr(state));
    ip = parsed.ip; port = parsed.port ?? 80;
  } catch {
    return res.status(400).send("bad state");
  }
  const target = `http://${ip}${port && port !== 80 ? `:${port}` : ""}/callback?code=${encodeURIComponent(code)}`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html><meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${target}">
  <title>Redirecting…</title>
  <body style="font-family:system-ui;background:#0f172a;color:#e5e7eb">
  <p>Redirecting to your device: <a style="color:#67e8f9" href="${target}">${target}</a></p>
  <script>location.replace(${JSON.stringify(target)});</script>
  </body>`);
}
