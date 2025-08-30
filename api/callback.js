// /api/callback.js
export default async function handler(req, res) {
  const { code, state } = req.query || {};
  if (!code || !state) {
    res.status(400).send("Missing code/state");
    return;
  }

  // state ми покладемо в base64url-рядок типу: { nonce, to }
  let to;
  try {
    // base64url → utf8
    const pad = (s) => s + "===".slice((s.length + 3) % 4);
    const json = Buffer.from(pad(state).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const parsed = JSON.parse(json);
    to = parsed?.to; // очікуємо "http://192.168.x.x"
  } catch (e) {
    res.status(400).send("Bad state");
    return;
  }

  if (!to || !/^https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(to)) {
    res.status(400).send("Bad target");
    return;
  }

  const url = `${to}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
  res.setHeader("Location", url);
  res.status(307).send("Redirecting to device...");
}
