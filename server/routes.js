import { Router } from "express";
import { getAppState, setAppState, findAuthByEmail } from "./db.js";
import { createUser, verifyPassword, setSessionCookie, clearSessionCookie, requireAuth } from "./auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { email, password, name, role, city } = req.body || {};
  if (!email || !password || !name || !role) return res.status(400).json({ error: "Missing fields" });
  if (!["owner", "foster", "shelter"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  if (findAuthByEmail(email)) return res.status(409).json({ error: "Email already registered" });
  const profile = await createUser({ email, password, name, role, city });
  setSessionCookie(res, profile.id);
  res.json(profile);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const userId = await verifyPassword(email || "", password || "");
  if (!userId) return res.status(401).json({ error: "Invalid email or password" });
  const user = getAppState().users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  setSessionCookie(res, userId);
  res.json(user);
});

router.post("/logout", (req, res) => { clearSessionCookie(res); res.json({ ok: true }); });

router.get("/me", requireAuth, (req, res) => {
  const user = getAppState().users.find((u) => u.id === req.userId);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  res.json(user);
});

router.get("/data", requireAuth, (req, res) => res.json(getAppState()));

router.put("/data", requireAuth, (req, res) => {
  setAppState(req.body);
  res.json({ ok: true });
});

export default router;
