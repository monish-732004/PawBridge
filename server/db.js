import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "pawbridge.db"));
db.pragma("journal_mode = WAL");

/* auth_users holds credentials only — never returned to the client.
   Everything else, including each user's public profile, lives in the
   app_state blob below, exactly like every other entity in the app:
   never queried relationally, always fetched whole and filtered in JS. */
db.exec(`
  CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
`);

const EMPTY_STATE = {
  users: [], pets: [], listings: [], requests: [], agreements: [], timeline: [], expenses: [], appointments: [],
  messages: [], sos: [], forum: [], stories: [], notifications: [], verifications: [],
  tripListings: [], tripRequests: [], tripBookings: [], visits: [],
};

if (!db.prepare("SELECT id FROM app_state WHERE id = 1").get()) {
  db.prepare("INSERT INTO app_state (id, data) VALUES (1, ?)").run(JSON.stringify(EMPTY_STATE));
}

export function getAppState() {
  const row = db.prepare("SELECT data FROM app_state WHERE id = 1").get();
  return JSON.parse(row.data);
}

export function setAppState(data) {
  db.prepare("UPDATE app_state SET data = ? WHERE id = 1").run(JSON.stringify(data));
}

export function findAuthByEmail(email) {
  return db.prepare("SELECT * FROM auth_users WHERE email = ?").get(email);
}

export function insertAuthUser({ id, email, passwordHash }) {
  db.prepare("INSERT INTO auth_users (id, email, password_hash) VALUES (?, ?, ?)").run(id, email, passwordHash);
}

export function countUsersByRole(role) {
  return getAppState().users.filter((u) => u.role === role).length;
}

export default db;
