import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { findAuthByEmail, insertAuthUser, countUsersByRole, getAppState, setAppState } from "./db.js";

export const JWT_SECRET = process.env.JWT_SECRET || "pawbridge-dev-secret-change-me";
export const COOKIE_NAME = "pb_session";

const CITY_COORDS = {
  kochi: { lat: 9.98, lng: 76.28 },
  bengaluru: { lat: 12.97, lng: 77.59 },
  bangalore: { lat: 12.97, lng: 77.59 },
  mumbai: { lat: 19.08, lng: 72.88 },
  delhi: { lat: 28.61, lng: 77.21 },
  chennai: { lat: 13.08, lng: 80.27 },
  hyderabad: { lat: 17.39, lng: 78.49 },
  pune: { lat: 18.52, lng: 73.86 },
};
const DEFAULT_COORDS = CITY_COORDS.kochi;

export function cityCoords(city) {
  return CITY_COORDS[(city || "").trim().toLowerCase()] || DEFAULT_COORDS;
}

function defaultProfile({ id, email, role, name, city }) {
  const { lat, lng } = cityCoords(city);
  const base = {
    id, email, role, name, city: city || "Kochi", avatar: "🧑", phone: "", lat, lng,
    verified: { phone: false, email: false, govId: false, selfie: false, address: false, noc: false, police: false, reference: false },
    renting: false, verifiedAt: null, blurb: "", ratings: [], flags: [], banned: false,
  };
  if (role === "shelter") {
    return {
      ...base,
      institutionVerified: { registration: false, license: false, facilityAddress: false, inspection: false },
      registration: "", capacity: 0, current: 0, medicalStaff: "", species: [], medicalOk: false, completed: 0,
      houseType: "Registered facility", experience: 0, petsOwned: "", kids: false, otherPets: false, workingHours: 0,
      availability: {},
    };
  }
  if (role === "foster") {
    return {
      ...base, experience: 0, petsOwned: "", houseType: "", kids: false, otherPets: false, workingHours: 0,
      capacity: 0, current: 0, species: [], medicalOk: false, completed: 0, availability: {},
    };
  }
  return base; // owner
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
}

const PROD = process.env.NODE_ENV === "production";

export function setSessionCookie(res, userId) {
  const token = signToken(userId);
  const cookieVal = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=${30 * 24 * 60 * 60}; SameSite=${PROD ? "None" : "Lax"}${PROD ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", cookieVal);
}

export function clearSessionCookie(res) {
  const cookieVal = `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=${PROD ? "None" : "Lax"}${PROD ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", cookieVal);
}

export function getTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.split(";").map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE_NAME}=`));
  return match ? match.slice(COOKIE_NAME.length + 1) : null;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res) {
  const token = getTokenFromRequest(req);
  if (!token) { res.status(401).json({ error: "Not signed in" }); return null; }
  const payload = verifyToken(token);
  if (!payload) { res.status(401).json({ error: "Not signed in" }); return null; }
  return payload.sub;
}

export async function createUser({ email, password, name, role, city }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const id = "u_" + randomUUID();
  await insertAuthUser({ id, email, passwordHash });
  const profile = defaultProfile({ id, email, role, name, city });
  const state = await getAppState();
  state.users.push(profile);
  await setAppState(state);
  return profile;
}

export async function verifyPassword(email, password) {
  const row = await findAuthByEmail(email);
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  return ok ? row.id : null;
}

export async function ensureAdminBootstrap() {
  const count = await countUsersByRole("admin");
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL || "admin@pawbridge.dev";
  const password = process.env.ADMIN_PASSWORD || "pawbridge-admin";
  const existing = await findAuthByEmail(email);
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 10);
  const id = "u_" + randomUUID();
  await insertAuthUser({ id, email, passwordHash });
  const state = await getAppState();
  state.users.push({
    id, email, role: "admin", name: "Admin", city: "Kochi", avatar: "🛡️", phone: "", ...cityCoords("Kochi"),
    verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: true, reference: true },
    renting: false, verifiedAt: Date.now(), blurb: "Trust & Safety", ratings: [], flags: [], banned: false,
  });
  await setAppState(state);
  console.log(`\n[PawBridge] Bootstrapped admin — email: ${email}  password: ${password}\n`);
}
