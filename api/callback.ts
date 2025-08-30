// api/callback.ts
// Проксі з Vercel → на пристрій (ESP): приймає ?code&state і редіректить на http://<ESP-IP>/callback

export default async (req: any, res: any) => {
  const { code, state } = (req.query || {}) as { code?: string; state?: string };

  if (!code || !state) {
    res.status(400).send("Missing code/state");
    return;
  }

  // state — це base64url(JSON): {"nonce":"...","to":"http://<ESP-IP>"}
  const decodeB64Url = (s: string) => {
    const pad = s + "===".slice((s.length + 3) % 4);
    return Buffer.from(pad.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  };

  let to: string | undefined;
  try {
    const json = decodeB64Url(state);
    const parsed = JSON.parse(json);
    to = parsed?.to;
  } catch {
    res.status(400).send("Bad state");
    return;
  }

  // Проста валідація: http(s)://<IPv4>(:port)
  const ipTargetRegex = /^https?:\/\/\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?$/;
  if (!to || !ipTargetRegex.test(to)) {
    res.status(400).send("Bad target");
    return;
  }

  const redirectUrl =
    `${to}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

  res.setHeader("Location", redirectUrl);
  // 307 зберігає метод і коректно редіректить браузер на пристрій
  res.status(307).send("Redirecting to device...");
};
