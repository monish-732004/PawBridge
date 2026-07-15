import { neon } from "@neondatabase/serverless";

const EMPTY_STATE = {
  users: [], pets: [], listings: [], requests: [], agreements: [], timeline: [],
  expenses: [], appointments: [], messages: [], sos: [], forum: [], stories: [],
  notifications: [], verifications: [], tripListings: [], tripRequests: [],
  tripBookings: [], visits: [],
};

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(process.env.DATABASE_URL);
}

export async function ensureSchema() {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}'
    )
  `;
  const existing = await db`SELECT id FROM app_state WHERE id = 1`;
  if (!existing.length) {
    await db`INSERT INTO app_state (id, data) VALUES (1, ${JSON.stringify(EMPTY_STATE)})`;
  }
}

export async function getAppState() {
  const db = sql();
  const rows = await db`SELECT data FROM app_state WHERE id = 1`;
  return rows[0]?.data ?? { ...EMPTY_STATE };
}

export async function setAppState(data) {
  const db = sql();
  await db`UPDATE app_state SET data = ${JSON.stringify(data)} WHERE id = 1`;
}

export async function findAuthByEmail(email) {
  const db = sql();
  const rows = await db`SELECT * FROM auth_users WHERE email = ${email}`;
  return rows[0] ?? null;
}

export async function insertAuthUser({ id, email, passwordHash }) {
  const db = sql();
  await db`INSERT INTO auth_users (id, email, password_hash) VALUES (${id}, ${email}, ${passwordHash})`;
}

export async function countUsersByRole(role) {
  const state = await getAppState();
  return state.users.filter((u) => u.role === role).length;
}
