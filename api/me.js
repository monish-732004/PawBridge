import { ensureSchema, getAppState } from "./_lib/db.js";
import { requireAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    await ensureSchema();
    const state = await getAppState();
    const user = state.users.find((u) => u.id === userId);
    if (!user) return res.status(401).json({ error: "Not signed in" });
    return res.json(user);
  } catch (e) {
    console.error("[me]", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
