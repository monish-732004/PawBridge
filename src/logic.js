import { now, DAY, avg } from "./constants.js";
import { tierOf, institutionTierOf, TRUST_REVERIFY_THRESHOLD, DURATIONS } from "./data.js";

export const distKm = (a, b) =>
  Math.round(Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 109) * 10) / 10;

export function updateStats(db, cid) {
  const ags = db.agreements.filter((a) => a.caregiverId === cid && a.signedCaregiver);
  let due = 0, on = 0;
  ags.forEach((ag) => {
    const span     = (ag.status === "active" ? now() : ag.end || now()) - ag.start;
    const expected = Math.max(1, Math.floor(span / (ag.cadence * DAY)));
    const posted   = db.timeline.filter((x) => x.agId === ag.id && x.kind === "update").length;
    due += expected; on += Math.min(posted, expected);
  });
  return { due, on, rate: due ? on / due : 1 };
}

function baseTier(u) {
  return u.role === "shelter" ? institutionTierOf(u) : tierOf(u);
}

/* Trust score must use the *stored* tier, not effectiveTier() below —
   effectiveTier() itself reads the trust score to decide whether to
   force a re-verification, and using it here would be circular. */
export function trustScore(db, u) {
  if (u.role === "owner" || u.role === "admin") return null;
  const tier = baseTier(u);
  const v = 40 * (tier === "deep" ? 1 : tier === "light" ? 0.5 : 0);
  const r = 30 * (u.ratings && u.ratings.length ? avg(u.ratings) / 5 : 0.6);
  const c = 30 * updateStats(db, u.id).rate;
  return Math.max(0, Math.round(v + r + c) - (u.flags ? u.flags.length : 0) * 10);
}

/* The tier a user can actually act on right now — downgrades the stored
   tier when re-verification is due: immediately if the trust score has
   dropped below the safety threshold (missed care updates), or one step
   if the last approval is more than 12 months old. */
export function effectiveTier(db, u) {
  const tier = baseTier(u);
  if (tier === "none") return "none";
  const score = trustScore(db, u);
  if (score !== null && score < TRUST_REVERIFY_THRESHOLD) return "none";
  const expired = now() - (u.verifiedAt || 0) > 365 * DAY;
  if (!expired) return tier;
  return tier === "deep" ? "light" : "none";
}

export function overdue(db, ag) {
  if (ag.status !== "active") return 0;
  const ups  = db.timeline.filter((x) => x.agId === ag.id && x.kind === "update");
  const last = ups.length ? Math.max.apply(null, ups.map((u) => u.at)) : ag.start;
  return Math.max(0, Math.floor((now() - last) / DAY) - ag.cadence);
}

/* Other accounts sharing this user's address — surfaced to admins reviewing
   a verification submission so they don't have to cross-reference by hand. */
export function addressReuse(db, userId) {
  const u = db.users.find((x) => x.id === userId);
  if (!u) return [];
  return db.users.filter((o) => o.id !== userId && o.lat === u.lat && o.lng === u.lng).map((o) => o.id);
}

/* Live fraud/flag signals, recomputed from current state rather than
   hand-authored — merged with a user's manually-assigned db.flags. */
export function detectSignals(db, u) {
  const signals = [];
  const shareAddr = db.users.filter((o) => o.id !== u.id && o.lat === u.lat && o.lng === u.lng);
  if (shareAddr.length) {
    const withBanned = shareAddr.filter((o) => o.banned);
    signals.push(withBanned.length
      ? `Shares an address with a banned account — ${withBanned.map((o) => o.name).join(", ")}`
      : `Shares an address with ${shareAddr.length} other active account${shareAddr.length > 1 ? "s" : ""}`);
  }
  const requestsByUser = [...db.requests, ...(db.tripRequests || [])]
    .filter((r) => r.fosterId === u.id || r.sitterId === u.id);
  const recent = requestsByUser.filter((r) => now() - r.created < 2 * DAY);
  if (recent.length >= 4) signals.push(`${recent.length} requests raised in the last 48 hours`);
  return signals;
}

export function match(db, listing, pet, cg) {
  const owner = db.users.find((u) => u.id === listing.ownerId);
  const P = [];
  const d = distKm(owner, cg);
  P.push({ k: "Distance", got: d <= 3 ? 20 : d <= 10 ? 15 : d <= 40 ? 8 : 2, max: 20, why: `${d} km away` });
  const big = pet.size === "large", flat = cg.houseType === "Apartment", hi = (pet.activity || "").startsWith("High");
  const hs = flat && (big || hi) ? 4 : cg.houseType === "Farm" ? 15 : flat ? 11 : 15;
  P.push({ k: "House type & space", got: hs, max: 15, why: flat && (big || hi) ? `Apartment — ${pet.name} is ${big ? "large" : "high-energy"}` : cg.houseType });
  const ex = Math.min(15, Math.round((cg.experience || 0) * 2.5));
  P.push({ k: "Experience", got: ex, max: 15, why: cg.experience ? `${cg.experience} years fostering` : "First-time foster" });
  const knows = cg.species && cg.species.indexOf(pet.species) > -1;
  P.push({ k: "Species familiarity", got: knows ? 15 : 3, max: 15, why: knows ? `Has kept ${pet.species}s before` : `Has never kept ${pet.species}s` });
  const needs = !!pet.condition, able = cg.medicalOk && effectiveTier(db, cg) === "deep";
  P.push({ k: "Special-needs capability", got: !needs ? 15 : able ? 15 : 3, max: 15, why: !needs ? "No special needs" : able ? "Medical experience, deep verified" : `${pet.condition} needs medical experience` });
  let hf = 10; const notes = [];
  if (cg.kids && !pet.kids)              { hf -= 6; notes.push("kids at home"); }
  if (cg.otherPets && !(pet.dogs || pet.cats)) { hf -= 4; notes.push("other pets at home"); }
  if ((cg.workingHours || 0) > 6)       { hf -= 3; notes.push(`alone ${cg.workingHours}h a day`); }
  P.push({ k: "Household fit", got: Math.max(0, hf), max: 10, why: notes.length ? notes.join(" · ") : "No conflicts" });
  const room = (cg.capacity || 0) - (cg.current || 0);
  const mo   = DURATIONS[listing.duration].months || 6;
  const need = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, mo);
  const free = need.every((m) => cg.availability && cg.availability[m]);
  P.push({ k: "Availability & capacity", got: room <= 0 ? 0 : free ? 10 : 4, max: 10, why: room <= 0 ? "At capacity" : free ? `${room} place(s) free` : "Unavailable for part of the term" });
  const lvl = effectiveTier(db, cg);
  const highlights = [];
  if (cg.experience) highlights.push(`Experience: ${cg.experience} years`);
  if (cg.petsOwned && cg.petsOwned !== "None") highlights.push(`Owns ${cg.petsOwned}`);
  if (cg.ratings && cg.ratings.length) highlights.push(`${avg(cg.ratings).toFixed(1)} rating`);
  highlights.push(`${d} km away`);
  return { score: P.reduce((a, b) => a + b.got, 0), parts: P, dist: d, lvl, needLvl: "deep", eligible: lvl === "deep", highlights };
}

/* ═══ TRIP CARE ══════════════════════════════════════════════ */

const VISITS_PER_DAY = { "1x daily": 1, "2x daily": 2, "3x daily": 3 };

export function tripSchedule(listing) {
  const perDay = VISITS_PER_DAY[listing.frequency] || 1;
  const days = Math.max(1, Math.round((listing.endDate - listing.startDate) / DAY) + 1);
  const slots = [];
  for (let d = 0; d < days; d++) {
    for (let v = 0; v < perDay; v++) {
      slots.push(listing.startDate + d * DAY + Math.round((v * DAY) / perDay));
    }
  }
  return slots;
}

export function tripCost(listing) {
  const schedule = tripSchedule(listing);
  const totalVisits = schedule.length;
  const days = Math.max(1, Math.round((listing.endDate - listing.startDate) / DAY) + 1);
  const totalAmount = listing.rateType === "perDay" ? listing.rate * days : listing.rate * totalVisits;
  const ratePerVisit = Math.round(totalAmount / totalVisits);
  return { totalVisits, totalAmount, ratePerVisit };
}
