import { ensureSchema, getAppState } from "./_lib/db.js";
import { verifyPassword, setSessionCookie, ensureAdminBootstrap } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    await ensureSchema();
    await ensureAdminBootstrap();
    const { email, password } = req.body || {};
    const userId = await verifyPassword(email || "", password || "");
    if (!userId) return res.status(401).json({ error: "Invalid email or password" });
    const state = await getAppState();
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    setSessionCookie(res, userId);
    return res.json(user);
  } catch (e) {
    console.error("[login]", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
