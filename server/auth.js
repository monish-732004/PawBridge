import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { findAuthByEmail, insertAuthUser, countUsersByRole, getAppState, setAppState } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "pawbridge-dev-secret-change-me";
const COOKIE_NAME = "pb_session";

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

export function setSessionCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), {
    httpOnly: true, sameSite: "lax", secure: false, maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

export function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    const { sub } = jwt.verify(token, JWT_SECRET);
    req.userId = sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Not signed in" });
  }
}

/* Creates the credential row + a matching public profile inside app_state.users,
   so every existing action in the app (rating, banning, verifying someone else…)
   can mutate that profile through the exact same whole-tree PUT it already uses
   for pets/listings/agreements — no separate per-user endpoint needed. */
export async function createUser({ email, password, name, role, city }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const id = "u_" + randomUUID();
  insertAuthUser({ id, email, passwordHash });
  const profile = defaultProfile({ id, email, role, name, city });
  const state = getAppState();
  state.users.push(profile);
  setAppState(state);
  return profile;
}

export async function verifyPassword(email, password) {
  const row = findAuthByEmail(email);
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  return ok ? row.id : null;
}

export async function ensureAdminBootstrap() {
  if (countUsersByRole("admin") > 0) return;
  const email = process.env.ADMIN_EMAIL || "admin@pawbridge.dev";
  const password = process.env.ADMIN_PASSWORD || "pawbridge-admin";
  if (findAuthByEmail(email)) return;
  const passwordHash = await bcrypt.hash(password, 10);
  const id = "u_" + randomUUID();
  insertAuthUser({ id, email, passwordHash });
  const state = getAppState();
  state.users.push({
    id, email, role: "admin", name: "Admin", city: "Kochi", avatar: "🛡️", phone: "", ...cityCoords("Kochi"),
    verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: true, reference: true },
    renting: false, verifiedAt: Date.now(), blurb: "Trust & Safety", ratings: [], flags: [], banned: false,
  });
  setAppState(state);
  console.log(`\n[PawBridge] Bootstrapped admin account — email: ${email}  password: ${password}\n`);
}
