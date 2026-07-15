/**
 * Wipes the Neon database and fills it with a curated, presentation-ready
 * demo dataset. Every demo account shares the same password.
 *
 * Usage:  node scripts/seed-demo.js
 */
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env.local") });

const sql = neon(process.env.DATABASE_URL);

const DEMO_PASSWORD = "demo1234";
const DAY = 86400000;
const t = Date.now();

/* ─── helpers ───────────────────────────────────────────────────── */
const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

async function main() {
  console.log("🗑️  Wiping existing data…");
  await sql`DELETE FROM auth_users`;
  await sql`DELETE FROM app_state`;

  console.log("🔑  Hashing password…");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  /* ─── USERS ─────────────────────────────────────────────────── */
  const users = [
    {
      id: "u1", email: "priya@pawbridge.demo", role: "owner",
      name: "Priya Menon", city: "Kochi", avatar: "🧕",
      phone: "+91 98470 xxxxx", lat: 9.98, lng: 76.28,
      verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: false, reference: true },
      renting: false, verifiedAt: t - 150 * DAY,
      blurb: "Moving to Berlin in six weeks. Need a loving home for Idli.", ratings: [5, 4], flags: [], banned: false,
    },
    {
      id: "u2", email: "arun@pawbridge.demo", role: "foster",
      name: "Arun Verma", city: "Kochi", avatar: "🧔",
      phone: "+91 90480 xxxxx", lat: 9.96, lng: 76.30,
      verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: true, reference: true },
      renting: false, verifiedAt: t - 120 * DAY,
      experience: 6, petsOwned: "2 Labradors", houseType: "Independent House",
      kids: false, otherPets: true, workingHours: 4, capacity: 3, current: 1,
      species: ["dog", "cat"], medicalOk: true, completed: 4,
      ratings: [5, 5, 4, 5],
      availability: { Jul: true, Aug: true, Sep: true, Oct: true, Nov: false, Dec: true },
      blurb: "Vet nurse by training. Fostered indies for six years.", flags: [], banned: false,
    },
    {
      id: "u3", email: "care@kochipaws.demo", role: "shelter",
      name: "Kochi Paws Shelter", city: "Kochi", avatar: "🏥",
      phone: "+91 484 xxxxxxx", lat: 10.01, lng: 76.31,
      institutionVerified: { registration: true, license: true, facilityAddress: true, inspection: true },
      verifiedAt: t - 240 * DAY,
      registration: "KL/AW/2016/442", capacity: 40, current: 24,
      medicalStaff: "2 full-time vets, 1 vet nurse",
      species: ["dog", "cat"], medicalOk: true, completed: 31,
      ratings: [4, 5, 4, 4, 5], houseType: "Registered facility",
      experience: 10, petsOwned: "24 in care", kids: false, otherPets: true, workingHours: 0,
      availability: { Jul: true, Aug: true, Sep: true, Oct: true, Nov: true, Dec: true },
      blurb: "Intake for medical and senior cases. Reg. KL/AW/2016/442.", flags: [], banned: false,
    },
    {
      id: "u4", email: "nadia@pawbridge.demo", role: "foster",
      name: "Nadia Roy", city: "Bengaluru", avatar: "👩",
      phone: "+91 99000 xxxxx", lat: 12.97, lng: 77.59,
      verified: { phone: true, email: true, govId: true, selfie: true, address: false, noc: false, police: false, reference: false },
      renting: true, verifiedAt: t - 20 * DAY,
      experience: 0, petsOwned: "None", houseType: "Apartment",
      kids: false, otherPets: false, workingHours: 2, capacity: 1, current: 0,
      species: ["cat"], medicalOk: false, completed: 0, ratings: [],
      availability: { Jul: true, Aug: true, Sep: false, Oct: true, Nov: true, Dec: true },
      blurb: "First-time foster. Work from home, quiet ground-floor flat.", flags: [], banned: false,
    },
    {
      id: "u5", email: "admin@pawbridge.demo", role: "admin",
      name: "Riya Nambiar", city: "Kochi", avatar: "🛡️",
      phone: "—", lat: 10.02, lng: 76.33,
      verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: true, reference: true },
      renting: false, verifiedAt: t - 300 * DAY,
      blurb: "Trust & Safety", ratings: [], flags: [], banned: false,
    },
    {
      id: "u6", email: "sameer@pawbridge.demo", role: "owner",
      name: "Sameer Iqbal", city: "Bengaluru", avatar: "🧑",
      phone: "+91 88800 xxxxx", lat: 12.93, lng: 77.61,
      verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: false, reference: false },
      renting: false, verifiedAt: t - 90 * DAY,
      blurb: "Three-week deployment to Chennai.", ratings: [5], flags: [], banned: false,
    },
    {
      id: "u7", email: "sarah@pawbridge.demo", role: "foster",
      name: "Sarah D'Cruz", city: "Kochi", avatar: "👱‍♀️",
      phone: "+91 94470 xxxxx", lat: 9.99, lng: 76.29,
      verified: { phone: true, email: true, govId: true, selfie: true, address: true, noc: false, police: true, reference: true },
      renting: false, verifiedAt: t - 180 * DAY,
      experience: 6, petsOwned: "2 Labradors", houseType: "Independent House",
      kids: true, otherPets: true, workingHours: 3, capacity: 2, current: 0,
      species: ["dog"], medicalOk: true, completed: 9,
      ratings: [5, 5, 5, 4, 5, 5],
      availability: { Jul: true, Aug: true, Sep: true, Oct: true, Nov: true, Dec: true },
      blurb: "Big garden, two Labradors who love company. Weekends are for the beach.", flags: [], banned: false,
    },
    {
      id: "u8", email: "vikram@pawbridge.demo", role: "foster",
      name: "Vikram Shetty", city: "Kochi", avatar: "🕵️",
      phone: "+91 70000 xxxxx", lat: 9.95, lng: 76.26,
      verified: { phone: false, email: false, govId: false, selfie: false, address: false, noc: false, police: false, reference: false },
      renting: false, verifiedAt: null,
      experience: 12, petsOwned: "Many", houseType: "Farm",
      kids: false, otherPets: true, workingHours: 0, capacity: 20, current: 0,
      species: ["dog", "cat"], medicalOk: true, completed: 0, ratings: [],
      availability: { Jul: true, Aug: true, Sep: true, Oct: true, Nov: true, Dec: true },
      blurb: "Can take any number of dogs, no questions asked. Immediate pickup.",
      flags: ["Selfie does not match the submitted ID", "6 requests raised in 48 hours"], banned: false,
    },
    {
      id: "u9", email: "vikas@pawbridge.demo", role: "foster",
      name: "Vikas Shetty", city: "Kochi", avatar: "🧑‍🦱",
      phone: "+91 70000 xxxx1", lat: 9.95, lng: 76.26,
      verified: { phone: true, email: true, govId: true, selfie: true, address: false, noc: false, police: false, reference: false },
      renting: true, verifiedAt: t - 10 * DAY,
      experience: 1, petsOwned: "None", houseType: "Apartment",
      kids: false, otherPets: false, workingHours: 5, capacity: 2, current: 0,
      species: ["dog"], medicalOk: false, completed: 0, ratings: [],
      availability: { Jul: true, Aug: true, Sep: true, Oct: true, Nov: true, Dec: true },
      blurb: "New to the city, keen to start fostering.", flags: [], banned: false,
    },
  ];

  /* ─── PETS ───────────────────────────────────────────────────── */
  const pets = [
    {
      id: "p1", ownerId: "u1", name: "Idli", emoji: "🐕", species: "dog", breed: "Indie",
      age: 4, gender: "Female", size: "medium", vaccinated: true, sterilised: true,
      condition: "", meds: "", history: "Spayed 2023. No prior illness.",
      kids: true, dogs: true, cats: false, food: "Home-cooked rice and chicken, twice a day",
      activity: "Moderate — two walks", temperament: "Calm, wary of loud noises",
      routine: "Sleeps at the foot of the bed. Will not eat without her blue bowl.", collar: true,
    },
    {
      id: "p2", ownerId: "u1", name: "Miso", emoji: "🐈", species: "cat", breed: "Domestic shorthair",
      age: 2, gender: "Male", size: "small", vaccinated: true, sterilised: true,
      condition: "Diabetes", meds: "Insulin, 2 units, twice daily after food",
      history: "Diagnosed diabetic Jan 2026. Stable on insulin.",
      kids: true, dogs: false, cats: true, food: "Prescription wet food, 8am and 8pm",
      activity: "Low", temperament: "Talkative, follows people room to room",
      routine: "Insulin immediately after food. Hides when the door knocks.", collar: false,
    },
    {
      id: "p3", ownerId: "u6", name: "Bruno", emoji: "🐶", species: "dog", breed: "Labrador",
      age: 7, gender: "Male", size: "large", vaccinated: true, sterilised: true,
      condition: "Early hip dysplasia", meds: "Glucosamine, one tablet with dinner",
      history: "Diagnosed 2025. Managed with supplements and flat walks.",
      kids: true, dogs: true, cats: true, food: "Dry kibble, measured, twice a day",
      activity: "Low", temperament: "Gentle, slow, sulks if ignored",
      routine: "No stairs. Ramp into the car.", collar: true,
    },
    {
      id: "p4", ownerId: "u6", name: "Kaju", emoji: "🐕‍🦺", species: "dog", breed: "Indie mix",
      age: 2, gender: "Male", size: "medium", vaccinated: true, sterilised: false,
      condition: "", meds: "", history: "Rescued 2024. Healthy.",
      kids: true, dogs: true, cats: false, food: "Kibble with curd, morning and night",
      activity: "High — needs a proper run daily", temperament: "Bouncy, no brakes",
      routine: "Run every morning or the sofa suffers.", collar: true,
    },
  ];

  /* ─── LISTINGS ───────────────────────────────────────────────── */
  const listings = [
    {
      id: "l1", petId: "p1", ownerId: "u1", duration: "adopt", reason: "Moving Abroad", pref: "Adoption Centre",
      note: "Relocating to Berlin. Indies can't clear the import rules and I won't put her through six months of quarantine.",
      city: "Kochi", start: t + 40 * DAY, status: "open", created: t - 9 * DAY,
    },
    {
      id: "l2", petId: "p2", ownerId: "u1", duration: "m6", reason: "Job Transfer", pref: "Foster Family",
      note: "Six months while I get settled and find a flat that takes cats. I am coming back for him.",
      city: "Kochi", start: t + 40 * DAY, status: "open", created: t - 4 * DAY,
    },
    {
      id: "l3", petId: "p3", ownerId: "u6", duration: "m1", reason: "Temporary Travel", pref: "Individual Caregiver",
      note: "Three-week posting. He needs someone who understands the hip and will not take him up stairs.",
      city: "Bengaluru", start: t + 6 * DAY, status: "open", created: t - 2 * DAY,
    },
  ];

  /* ─── REQUESTS ───────────────────────────────────────────────── */
  const requests = [
    {
      id: "rq1", listingId: "l2", fosterId: "u2", status: "pending", created: t - 3 * DAY,
      note: "I've managed a diabetic cat before — twice-daily insulin is routine for me, and I work from home.",
    },
    {
      id: "rq2", listingId: "l1", fosterId: "u3", status: "pending", created: t - 2 * DAY,
      note: "We have room and a strong indie adoption pipeline.",
    },
    {
      id: "rq3", listingId: "l1", fosterId: "u7", status: "pending", created: t - 1 * DAY,
      note: "Big garden, and my kids are old enough to be gentle.",
    },
  ];

  /* ─── AGREEMENTS ─────────────────────────────────────────────── */
  const agreements = [
    {
      id: "ag1", petId: "p4", ownerId: "u6", caregiverId: "u2", duration: "m3",
      start: t - 26 * DAY, end: t + 64 * DAY, cadence: 7, stipend: 3500, medicalCap: 5000, gps: true,
      ownership: "Owner retains full legal custody throughout.",
      returnConditions: "Either party may end this arrangement with 14 days' written notice.",
      signedOwner: t - 27 * DAY, signedCaregiver: t - 27 * DAY,
      status: "active", returnRequested: null, reviews: {},
    },
  ];

  /* ─── TIMELINE ───────────────────────────────────────────────── */
  const timeline = [
    { id: "tl1", petId: "p4", agId: "ag1", kind: "event", text: "Digital agreement signed by both parties", at: t - 27 * DAY },
    { id: "tl2", petId: "p4", agId: "ag1", kind: "event", text: "Placement started — Kaju handed over to Arun Verma", at: t - 26 * DAY },
    { id: "tl3", petId: "p4", agId: "ag1", kind: "update", by: "u2", at: t - 25 * DAY, mood: "adjusting", photo: "🐕‍🦺", weight: 18.2, reactions: [], text: "First night was rough — he paced until about 2am, then slept." },
    { id: "tl4", petId: "p4", agId: "ag1", kind: "care", by: "u2", act: "fed", at: t - 24 * DAY },
    { id: "tl5", petId: "p4", agId: "ag1", kind: "update", by: "u2", at: t - 18 * DAY, mood: "settled", photo: "🦴", weight: 18.4, reactions: [], text: "Week two. He's found a spot by the window and claimed it." },
    { id: "tl6", petId: "p4", agId: "ag1", kind: "medical", by: "u2", at: t - 11 * DAY, vet: "Dr. Anand Pillai", text: "Routine check-up at Ernakulam Vet Clinic. Weight good, teeth fine." },
    { id: "tl7", petId: "p4", agId: "ag1", kind: "update", by: "u2", at: t - 11 * DAY, mood: "thriving", photo: "🐾", weight: 18.9, reactions: [], text: "Vet is happy with him. He tried to eat the receipt." },
    { id: "tl8", petId: "p4", agId: "ag1", kind: "care", by: "u2", act: "walk", at: t - 2 * DAY },
    { id: "tl9", petId: "p4", agId: "ag1", kind: "update", by: "u2", at: t - 1 * DAY, mood: "thriving", photo: "🌟", weight: 19.1, reactions: [], text: "Almost a month in — he now runs to the door when I grab the leash." },
  ];

  /* ─── EXPENSES ───────────────────────────────────────────────── */
  const expenses = [
    { id: "ex1", petId: "p4", agId: "ag1", by: "u2", cat: "food",        amount: 2400, note: "Kibble, 10kg",       at: t - 20 * DAY, reimbursed: true  },
    { id: "ex2", petId: "p4", agId: "ag1", by: "u2", cat: "vet",         amount: 900,  note: "Routine check-up",  at: t - 11 * DAY, reimbursed: true  },
    { id: "ex3", petId: "p4", agId: "ag1", by: "u2", cat: "medicine",    amount: 640,  note: "Deworming tablets", at: t - 9  * DAY, reimbursed: false },
    { id: "ex4", petId: "p4", agId: "ag1", by: "u2", cat: "accessories", amount: 1150, note: "New harness",       at: t - 5  * DAY, reimbursed: false },
    { id: "ex5", petId: "p4", agId: "ag1", by: "u2", cat: "food",        amount: 2400, note: "Kibble restock",    at: t - 1  * DAY, reimbursed: false },
  ];

  /* ─── APPOINTMENTS ───────────────────────────────────────────── */
  const appointments = [
    { id: "ap1", petId: "p4", type: "Check-up",    clinic: "Ernakulam Vet Clinic",  at: t - 11 * DAY, status: "completed", by: "u2" },
    { id: "ap2", petId: "p4", type: "Vaccination", clinic: "Ernakulam Vet Clinic",  at: t + 12 * DAY, status: "booked",    by: "u2" },
    { id: "ap3", petId: "p2", type: "Diabetes Review", clinic: "City Vet Clinic",   at: t + 3  * DAY, status: "booked",   by: "u1" },
  ];

  /* ─── MESSAGES ───────────────────────────────────────────────── */
  const messages = [
    { id: "m1", thread: "ag1", from: "u6", at: t - 24 * DAY, text: "Thank you for the first update. He looks happy." },
    { id: "m2", thread: "ag1", from: "u2", at: t - 24 * DAY, text: "He's in good hands. I'll send a photo every evening." },
    { id: "m3", thread: "ag1", from: "u6", at: t - 18 * DAY, text: "The window photo made my day 😂 Thank you Arun." },
    { id: "m4", thread: "ag1", from: "u2", at: t - 17 * DAY, text: "He's figured out that sitting on the windowsill gets him attention from the street." },
    { id: "m5", thread: "ag1", from: "u6", at: t - 11 * DAY, text: "All good at the vet? Weights looking good?" },
    { id: "m6", thread: "ag1", from: "u2", at: t - 11 * DAY, text: "Perfect. Dr. Pillai says he's the healthiest dog he's seen all week." },
  ];

  /* ─── SOS ────────────────────────────────────────────────────── */
  const sos = [
    {
      id: "sos1", raisedBy: "u1", petId: "p2", at: t - 60 * DAY,
      reason: "Foster hospitalised suddenly",
      details: "My foster Nimmi's caregiver had an emergency surgery. Need someone to pick her up from Thevara tonight.",
      status: "resolved", resolvedBy: "u3", resolvedAt: t - 60 * DAY + 4 * 3600000,
      respondents: ["u3", "u7"],
    },
  ];

  /* ─── FORUM ──────────────────────────────────────────────────── */
  const forum = [
    {
      id: "f1", cat: "Lost Pets", title: "Black indie female, red collar — missing near Panampilly Nagar",
      by: "u1", at: t - 6 * DAY,
      body: "Went missing Tuesday evening near the canal. Answers to Kutty. She's microchipped. Please share.",
      replies: [
        { by: "u2", at: t - 5 * DAY, text: "Sharing in the Kadavanthra WhatsApp group right now." },
        { by: "u7", at: t - 5 * DAY, text: "Posted on the Kochi Pets Facebook group too. Fingers crossed." },
      ],
    },
    {
      id: "f2", cat: "Training Tips", title: "Foster dog won't settle at night — what worked for you?",
      by: "u4", at: t - 3 * DAY,
      body: "Second week and he still paces until 2am. Tried white noise, a ticking clock, nothing works.",
      replies: [
        { by: "u7", at: t - 3 * DAY, text: "Give it three weeks before you change anything. Routine is everything." },
        { by: "u2", at: t - 2 * DAY, text: "An unwashed t-shirt of the owner's in the bed does more than any technique. Ask Priya to send one." },
        { by: "u4", at: t - 2 * DAY, text: "That actually worked!! Thank you both 🙏" },
      ],
    },
    {
      id: "f3", cat: "Nutrition", title: "Feeding a diabetic cat on a foster budget",
      by: "u2", at: t - 8 * DAY,
      body: "Prescription wet food is ₹180 a day. Anyone found a vet-approved alternative that doesn't break the bank?",
      replies: [
        { by: "u3", at: t - 7 * DAY, text: "We use Royal Canin Diabetic for shelter cats. In bulk it comes to about ₹130/day. DM me." },
      ],
    },
    {
      id: "f4", cat: "Health & Vets", title: "Best vet in Kochi for senior dogs with mobility issues?",
      by: "u6", at: t - 15 * DAY,
      body: "Bruno has hip dysplasia. Looking for a vet who does hydrotherapy or at least proper physio assessment.",
      replies: [
        { by: "u7", at: t - 14 * DAY, text: "Dr. Anand Pillai at Ernakulam Vet Clinic does full ortho assessments. He's excellent." },
        { by: "u2", at: t - 13 * DAY, text: "Seconded. He has a hydrotherapy tub at his Vyttila branch." },
      ],
    },
  ];

  /* ─── STORIES ────────────────────────────────────────────────── */
  const stories = [
    {
      id: "s1", pet: "Nimmi", emoji: "🐈", by: "Priya Menon → Kochi Paws",
      at: t - 40 * DAY,
      text: "Fostered for four months while her owner finished chemotherapy. She went home in March, fatter and happier.",
    },
    {
      id: "s2", pet: "Tiger", emoji: "🐕", by: "Sarah D'Cruz",
      at: t - 70 * DAY,
      text: "Owner moved to Dubai. Sarah fostered for six months, then adopted him properly. He's now a permanent beach dog.",
    },
    {
      id: "s3", pet: "Coco", emoji: "🐩", by: "Kochi Paws Shelter",
      at: t - 20 * DAY,
      text: "Emergency SOS at 11pm when her foster was hospitalised. Rehomed within four hours. PawBridge works.",
    },
    {
      id: "s4", pet: "Mango", emoji: "🐕", by: "Arun Verma",
      at: t - 10 * DAY,
      text: "Three-month foster turned permanent after the owner's job took them overseas. Now Mango rules the house.",
    },
  ];

  /* ─── NOTIFICATIONS ──────────────────────────────────────────── */
  const notifications = [
    { id: "n1", to: "u6", text: "Arun Verma logged a walk for Kaju",              at: t - 2 * DAY, read: false },
    { id: "n2", to: "u6", text: "Kaju's vaccination is due in 12 days",           at: t - 1 * DAY, read: false },
    { id: "n3", to: "u1", text: "Sarah D'Cruz sent an adoption request for Idli", at: t - 1 * DAY, read: false },
    { id: "n4", to: "u1", text: "Arun Verma sent a foster request for Miso",      at: t - 3 * DAY, read: true  },
    { id: "n5", to: "u5", text: "Vikram Shetty flagged — 2 trust signals",        at: t - 1 * DAY, read: false },
    { id: "n6", to: "u2", text: "Sameer Iqbal left you a 5★ rating",              at: t - 4 * DAY, read: true  },
    { id: "n7", to: "u1", text: "Kochi Paws Shelter sent an adoption request for Idli", at: t - 2 * DAY, read: false },
  ];

  /* ─── VERIFICATIONS ──────────────────────────────────────────── */
  const verifications = [
    { id: "v1", userId: "u4", kind: "individual", tier: "deep", checks: ["address", "police", "reference"], at: t - 2 * DAY, status: "pending" },
    { id: "v2", userId: "u9", kind: "individual", tier: "light", checks: ["phone", "email"], at: t - 1 * DAY, status: "pending" },
  ];

  /* ─── TRIP LISTINGS ──────────────────────────────────────────── */
  const tripListings = [
    {
      id: "tp1", petId: "p2", ownerId: "u1", city: "Kochi",
      startDate: t + 5 * DAY, endDate: t + 7 * DAY,
      frequency: "2x daily", tasks: { feeding: true, walking: false, medication: true, playtime: false },
      rateType: "perVisit", rate: 250,
      note: "Weekend trip. Miso needs insulin at 8am and 8pm without fail. Will not eat without encouragement.",
      status: "open", created: t - 2 * DAY,
    },
    {
      id: "tp2", petId: "p4", ownerId: "u6", city: "Bengaluru",
      startDate: t + 8 * DAY, endDate: t + 11 * DAY,
      frequency: "1x daily", tasks: { feeding: true, walking: true, medication: false, playtime: true },
      rateType: "perDay", rate: 600,
      note: "Kaju needs a solid 30-min run. He will destroy furniture otherwise.",
      status: "open", created: t - 1 * DAY,
    },
  ];

  /* ─── TRIP REQUESTS ──────────────────────────────────────────── */
  const tripRequests = [
    {
      id: "trq1", listingId: "tp1", sitterId: "u4", status: "pending", created: t - 1 * DAY,
      note: "I'm nearby and free that weekend — happy to send photos after each visit.",
    },
    {
      id: "trq2", listingId: "tp1", sitterId: "u7", status: "pending", created: t - 12 * 3600000,
      note: "Diabetic cats are not new to me. I can do all six visits.",
    },
  ];

  /* ─── TRIP BOOKINGS ──────────────────────────────────────────── */
  const tripBookings = [
    {
      id: "tb1", listingId: "tp2", petId: "p3", ownerId: "u6", sitterId: "u2",
      startDate: t - 8 * DAY, endDate: t - 5 * DAY,
      ratePerVisit: 500, totalAmount: 1500, releasedAmount: 1500,
      escrow: "released", status: "completed", releasedAt: t - 5 * DAY,
      tasks: { feeding: true, walking: true, medication: false, playtime: false },
    },
  ];

  /* ─── VISITS ─────────────────────────────────────────────────── */
  const visits = [
    { id: "vi1", bookingId: "tb1", sitterId: "u2", at: t - 8 * DAY, status: "completed", note: "Bruno walked 20 min, ate well." },
    { id: "vi2", bookingId: "tb1", sitterId: "u2", at: t - 7 * DAY, status: "completed", note: "Slower today but happy." },
    { id: "vi3", bookingId: "tb1", sitterId: "u2", at: t - 6 * DAY, status: "missed",    note: "" },
    { id: "vi4", bookingId: "tb1", sitterId: "u2", at: t - 5 * DAY, status: "completed", note: "Last visit. He did great." },
  ];

  /* ─── INSERT ─────────────────────────────────────────────────── */
  console.log("👤  Inserting auth users…");
  for (const u of users) {
    await sql`INSERT INTO auth_users (id, email, password_hash) VALUES (${u.id}, ${u.email}, ${passwordHash})`;
  }

  const appState = {
    users, pets, listings, requests, agreements, timeline, expenses,
    appointments, messages, sos, forum, stories, notifications, verifications,
    tripListings, tripRequests, tripBookings, visits,
  };

  console.log("💾  Writing app state…");
  await sql`INSERT INTO app_state (id, data) VALUES (1, ${JSON.stringify(appState)})`;

  console.log(`\n✅  Demo data seeded! Every account's password is: ${DEMO_PASSWORD}\n`);
  console.log("  EMAIL                         ROLE      NAME");
  console.log("  " + "─".repeat(55));
  users.forEach((u) =>
    console.log(`  ${u.email.padEnd(30)} ${u.role.padEnd(9)} ${u.name}`)
  );
  console.log("");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
