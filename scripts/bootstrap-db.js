/**
 * Run once to initialise the Neon database tables.
 * Usage: node scripts/bootstrap-db.js
 */
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL not set. Check .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const EMPTY_STATE = {
  users: [], pets: [], listings: [], requests: [], agreements: [], timeline: [],
  expenses: [], appointments: [], messages: [], sos: [], forum: [], stories: [],
  notifications: [], verifications: [], tripListings: [], tripRequests: [],
  tripBookings: [], visits: [],
};

async function main() {
  console.log("🔧  Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `;
  console.log("   ✓ auth_users");

  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}'
    )
  `;
  console.log("   ✓ app_state");

  const existing = await sql`SELECT id FROM app_state WHERE id = 1`;
  if (!existing.length) {
    await sql`INSERT INTO app_state (id, data) VALUES (1, ${JSON.stringify(EMPTY_STATE)})`;
    console.log("   ✓ Seeded empty app_state");
  } else {
    console.log("   ℹ app_state row already exists — skipped seed");
  }

  console.log("\n✅  Database ready!");
  process.exit(0);
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
