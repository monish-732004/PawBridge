import { ensureSchema, getAppState, setAppState } from "./_lib/db.js";
import { requireAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  const userId = requireAuth(req, res);
  if (!userId) return;
  try {
    await ensureSchema();
    if (req.method === "GET") {
      const state = await getAppState();
      return res.json(state);
    }
    if (req.method === "PUT") {
      await setAppState(req.body);
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[data]", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
