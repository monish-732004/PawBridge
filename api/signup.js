import { ensureSchema, findAuthByEmail } from "./_lib/db.js";
import { createUser, setSessionCookie, ensureAdminBootstrap } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    await ensureSchema();
    await ensureAdminBootstrap();
    const { email, password, name, role, city } = req.body || {};
    if (!email || !password || !name || !role)
      return res.status(400).json({ error: "Missing fields" });
    if (!["owner", "foster", "shelter"].includes(role))
      return res.status(400).json({ error: "Invalid role" });
    const existing = await findAuthByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const profile = await createUser({ email, password, name, role, city });
    setSessionCookie(res, profile.id);
    return res.json(profile);
  } catch (e) {
    console.error("[signup]", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
