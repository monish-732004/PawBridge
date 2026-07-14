import { useState, useEffect, useRef } from "react";
import {
  Link2, ShieldCheck, AlertTriangle, Home, PawPrint, Plus, Check, X,
  Clock, MessageSquare, Star, FileText, PenLine, Send,
  Building2, Siren, BarChart3, ChevronRight, Search, Eye,
  Ban, Bell, Sparkles, Wallet, Syringe, Navigation, Flame, MessagesSquare,
  CalendarCheck, Trophy, Footprints, Users, HelpCircle,
} from "lucide-react";

import { C, FONTS, display, body, mono, DAY, now, uid, avg, rupee, fmt, ago } from "./constants.js";
import {
  DURATIONS, CARE_ACTS, AI_FINDINGS,
  TIER_LABEL, LIGHT_CHECKS, DEEP_CHECKS, INSTITUTION_CHECKS,
} from "./data.js";
import { getData, putData } from "./api.js";
import { match, overdue, trustScore, effectiveTier, addressReuse, detectSignals, tripSchedule, tripCost } from "./logic.js";
import {
  Card, Btn, Section, Stat, Empty, Pill, PetHead, DurTag, Ring, VBadge, Trust, Stars,
} from "./primitives.jsx";

import HomeView from "./views/HomeView.jsx";
import CareDetail from "./views/CareDetail.jsx";
import MoneyView from "./views/MoneyView.jsx";
import ProfileView from "./views/ProfileView.jsx";
import CommunityView from "./views/CommunityView.jsx";
import AnalyticsView from "./views/AnalyticsView.jsx";
import TripCareView from "./views/TripCareView.jsx";
import TripBrowseView from "./views/TripBrowseView.jsx";
import TripDetail from "./views/TripDetail.jsx";

import PetModal from "./modals/PetModal.jsx";
import ListingModal from "./modals/ListingModal.jsx";
import ApplyModal from "./modals/ApplyModal.jsx";
import WhyModal from "./modals/WhyModal.jsx";
import AgreementModal from "./modals/AgreementModal.jsx";
import UpdateModal from "./modals/UpdateModal.jsx";
import AIModal from "./modals/AIModal.jsx";
import BookModal from "./modals/BookModal.jsx";
import ExpenseModal from "./modals/ExpenseModal.jsx";
import SOSModal from "./modals/SOSModal.jsx";
import ResolveModal from "./modals/ResolveModal.jsx";
import GPSModal from "./modals/GPSModal.jsx";
import RateModal from "./modals/RateModal.jsx";
import VerifyModal from "./modals/VerifyModal.jsx";
import PostModal from "./modals/PostModal.jsx";
import TripListingModal from "./modals/TripListingModal.jsx";
import TripApplyModal from "./modals/TripApplyModal.jsx";
import LogVisitModal from "./modals/LogVisitModal.jsx";
import MissVisitModal from "./modals/MissVisitModal.jsx";
import CompleteProfileModal from "./modals/CompleteProfileModal.jsx";

/* Deterministic pseudo-random selfie-to-ID match confidence, stable per
   verification id — a simulated signal, same fidelity as the AI health scan. */
function selfieConfidence(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100;
  return 60 + (h % 40);
}

function releaseBookingEscrow(d, booking) {
  const visits = d.visits.filter((v) => v.bookingId === booking.id);
  const missedCount = visits.filter((v) => v.status === "missed").length;
  const withheld = missedCount * booking.ratePerVisit;
  booking.releasedAmount = Math.max(0, booking.totalAmount - withheld);
  booking.escrow = missedCount > 0 ? "partial_released" : "released";
  booking.releasedAt = now();
  booking.status = "completed";
  const listing = d.tripListings.find((l) => l.id === booking.listingId);
  if (listing) listing.status = "completed";
  const pet = d.pets.find((p) => p.id === booking.petId);
  d.notifications.push({ id: uid("n"), to: booking.sitterId, at: now(), read: false,
    text: `${rupee(booking.releasedAmount)} released for ${pet ? pet.name : "the"} trip` });
}

export default function PawBridge({ sessionUser, onLogout }) {
  const meId = sessionUser.id;
  const [db, setDb] = useState(null);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [focus, setFocus] = useState(null);
  const [tripFocus, setTripFocus] = useState(null);
  const [bell, setBell] = useState(false);
  const saveT = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getData();
        setDb(data);
        const meRow = data.users.find((u) => u.id === meId);
        const incomplete = meRow && (
          (meRow.role === "foster" && !meRow.houseType) ||
          (meRow.role === "shelter" && !meRow.registration)
        );
        if (incomplete) setModal({ t: "completeProfile" });
      } catch (e) {
        setToast("Failed to load data — is the API server running?");
      }
    })();
  }, [meId]);

  useEffect(() => {
    if (!db) return;
    if (!loaded.current) { loaded.current = true; return; } // skip the write triggered by the initial load
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => { putData(db).catch(() => {}); }, 400);
  }, [db]);

  /* Best-effort auto-release: whenever state changes, sweep active bookings
     whose trip has ended and release escrow — the closest a client-only app
     (no server/cron) can get to a true automatic release. */
  useEffect(() => {
    if (!db) return;
    const due = db.tripBookings.filter((b) => {
      if (b.status !== "active" || b.escrow !== "held") return false;
      const listing = db.tripListings.find((l) => l.id === b.listingId);
      return listing && now() > listing.endDate;
    });
    if (due.length) {
      setDb((d) => {
        const n = JSON.parse(JSON.stringify(d));
        due.forEach((b) => {
          const booking = n.tripBookings.find((x) => x.id === b.id);
          if (booking && booking.escrow === "held") releaseBookingEscrow(n, booking);
        });
        return n;
      });
    }
  }, [db]);

  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 2800); };
  const up = (fn) => setDb((d) => { const n = JSON.parse(JSON.stringify(d)); fn(n); return n; });
  const notify = (d, to, text) => d.notifications.push({ id: uid("n"), to, text, at: now(), read: false });

  if (!db) return <div className="flex h-64 items-center justify-center" style={{ background: C.paper, ...body, color: C.muted }}>Loading PawBridge…</div>;

  const me = db.users.find((u) => u.id === meId);
  const R = me.role;
  const myNotifs = db.notifications.filter((n) => n.to === meId).sort((a, b) => b.at - a.at);
  const unread = myNotifs.filter((n) => !n.read).length;

  /* ── actions ── */
  const addPet = (p) => { up((d) => d.pets.push({ ...p, id: uid("p"), ownerId: meId })); say(`${p.name} registered.`); setModal(null); };

  const publish = (l) => {
    up((d) => {
      d.listings.push({ ...l, id: uid("l"), ownerId: meId, city: me.city, status: "open", created: now() });
      const pet = d.pets.find((p) => p.id === l.petId);
      d.users.filter((u) => u.role === "foster" && effectiveTier(d, u) !== "none" && !u.banned)
        .forEach((u) => notify(d, u.id, `New listing near you — ${pet.name}`));
    });
    say("Listing published. The recommendation engine is ranking caregivers now."); setModal(null); setTab("matches");
  };

  const request = (listingId, note) => {
    up((d) => {
      d.requests.push({ id: uid("rq"), listingId, fosterId: meId, note, status: "pending", created: now() });
      const l = d.listings.find((x) => x.id === listingId);
      notify(d, l.ownerId, `${me.name} sent a ${DURATIONS[l.duration].permanent ? "adoption" : "foster"} request`);
    });
    say("Request sent to the owner."); setModal(null);
  };

  const decline = (rid) => { up((d) => { d.requests.find((r) => r.id === rid).status = "declined"; }); say("Applicant declined and released."); };

  const sign = (rid, terms) => {
    const rq = db.requests.find((r) => r.id === rid);
    const l = db.listings.find((x) => x.id === rq.listingId);
    const dur = DURATIONS[l.duration];
    const agId = uid("ag");
    up((d) => {
      d.requests.forEach((r) => { if (r.listingId === l.id) r.status = r.id === rid ? "accepted" : "declined"; });
      d.listings.find((x) => x.id === l.id).status = "matched";
      d.agreements.push({
        id: agId, petId: l.petId, ownerId: l.ownerId, caregiverId: rq.fosterId, duration: l.duration,
        start: l.start, end: dur.permanent ? null : l.start + dur.months * 30 * DAY,
        cadence: terms.cadence, stipend: terms.stipend, medicalCap: terms.medicalCap, gps: terms.gps,
        ownership: dur.permanent ? "Custody transfers to the caregiver on completion, subject to admin approval." : "Owner retains full legal custody throughout.",
        returnConditions: dur.permanent ? "The pet is not returned. Update rights continue for the agreed window." : "Either party may end this arrangement with 14 days' written notice.",
        signedOwner: now(), signedCaregiver: null,
        status: dur.permanent ? "awaiting_admin" : "awaiting_signature", returnRequested: null, reviews: {},
      });
      const pet = d.pets.find((p) => p.id === l.petId);
      d.timeline.push({ id: uid("tl"), petId: l.petId, agId, kind: "event", text: `Digital agreement issued and signed by ${me.name}`, at: now() });
      notify(d, rq.fosterId, `${me.name} accepted your request — the agreement needs your signature`);
      if (dur.permanent) d.users.filter((u) => u.role === "admin").forEach((a) => notify(d, a.id, `Adoption approval needed — ${pet.name}`));
    });
    say(dur.permanent ? "Signed. This adoption now needs admin approval." : "Signed. Waiting on the caregiver's signature.");
    setModal(null); setTab(R === "owner" ? "timeline" : "care");
  };

  const approveAdoption = (agId, ok) => {
    up((d) => {
      const ag = d.agreements.find((a) => a.id === agId);
      ag.status = ok ? "awaiting_signature" : "declined";
      notify(d, ag.ownerId, ok ? "Adoption approved by admin" : "Adoption declined by admin");
      notify(d, ag.caregiverId, ok ? "Adoption approved — please sign the agreement" : "Adoption declined by admin");
    });
    say(ok ? "Adoption approved." : "Adoption declined.");
  };

  const countersign = (agId) => {
    up((d) => {
      const ag = d.agreements.find((a) => a.id === agId);
      ag.signedCaregiver = now(); ag.status = "active";
      const cg = d.users.find((u) => u.id === ag.caregiverId);
      cg.current = (cg.current || 0) + 1;
      const pet = d.pets.find((p) => p.id === ag.petId);
      d.timeline.push({ id: uid("tl"), petId: pet.id, agId, kind: "event", text: "Digital agreement signed by both parties", at: now() });
      d.timeline.push({ id: uid("tl"), petId: pet.id, agId, kind: "event", text: `Placement started — ${pet.name} handed over to ${me.name}`, at: now() });
      notify(d, ag.ownerId, `${me.name} signed. ${pet.name}'s timeline has begun.`);
    });
    say("Signed. The timeline has begun.");
  };

  const postUpdate = (agId, petId, u) => {
    up((d) => {
      d.timeline.push({ id: uid("tl"), petId, agId, kind: "update", by: meId, at: now(), reactions: [], ...u });
      const ag = d.agreements.find((a) => a.id === agId);
      const pet = d.pets.find((p) => p.id === petId);
      notify(d, ag.ownerId, `${me.name} posted an update on ${pet.name}`);
    });
    say("Update posted. The owner has been notified."); setModal(null);
  };

  const logCare = (agId, petId, act) => {
    up((d) => {
      d.timeline.push({ id: uid("tl"), petId, agId, kind: "care", by: meId, act, at: now() });
      const ag = d.agreements.find((a) => a.id === agId);
      const pet = d.pets.find((p) => p.id === petId);
      notify(d, ag.ownerId, `${CARE_ACTS[act].label} — ${pet.name}`);
    });
    say(`${CARE_ACTS[act].label} logged.`);
  };

  const react = (id) => up((d) => { const x = d.timeline.find((i) => i.id === id); x.reactions = [...(x.reactions || []), meId]; });

  const reqReturn = (agId) => {
    up((d) => {
      const ag = d.agreements.find((a) => a.id === agId);
      ag.returnRequested = now();
      d.timeline.push({ id: uid("tl"), petId: ag.petId, agId, kind: "event", text: "Owner requested return — 14-day notice period running", at: now() });
      notify(d, ag.caregiverId, `${me.name} requested the pet back`);
    });
    say("Return requested.");
  };

  const confirmReturn = (agId) => {
    up((d) => {
      const ag = d.agreements.find((a) => a.id === agId);
      ag.status = "completed";
      const cg = d.users.find((u) => u.id === ag.caregiverId);
      cg.current = Math.max(0, (cg.current || 0) - 1);
      d.listings.filter((l) => l.petId === ag.petId).forEach((l) => { l.status = "closed"; });
      d.timeline.push({ id: uid("tl"), petId: ag.petId, agId, kind: "event", text: "Handover confirmed — placement completed", at: now() });
      notify(d, ag.ownerId, `Handover confirmed. Please rate ${me.name}.`);
    });
    say("Handover confirmed. Please leave a rating.");
  };

  const rate = (agId, r, txt) => {
    up((d) => {
      const ag = d.agreements.find((a) => a.id === agId);
      ag.reviews[meId] = { rating: r, text: txt, at: now() };
      const otherId = meId === ag.ownerId ? ag.caregiverId : ag.ownerId;
      const ou = d.users.find((u) => u.id === otherId);
      ou.ratings = [...(ou.ratings || []), r];
      if (meId === ag.ownerId) ou.completed = (ou.completed || 0) + 1;
      d.timeline.push({ id: uid("tl"), petId: ag.petId, agId, kind: "event", text: `Rating left by ${me.name}`, at: now() });
    });
    say("Rating submitted."); setModal(null);
  };

  const raiseSOS = (agId, reason) => {
    const ag = db.agreements.find((a) => a.id === agId);
    up((d) => {
      const pet = d.pets.find((p) => p.id === ag.petId);
      d.sos.push({ id: uid("sos"), petId: ag.petId, agId, by: meId, reason, at: now(), status: "open", responders: [] });
      d.users.filter((u) => (u.role === "foster" || u.role === "shelter") && u.id !== meId && effectiveTier(d, u) === "deep" && !u.banned)
        .forEach((u) => notify(d, u.id, `SOS — ${pet.name} needs emergency relocation`));
      notify(d, ag.ownerId, `Emergency relocation raised for ${pet.name}`);
      d.users.filter((u) => u.role === "admin").forEach((a) => notify(d, a.id, "SOS raised — emergency relocation"));
      d.timeline.push({ id: uid("tl"), petId: ag.petId, agId, kind: "event", text: `Emergency SOS raised — ${reason}`, at: now() });
    });
    say("SOS broadcast to every verified caregiver in range."); setModal(null);
  };

  const respondSOS = (sid) => {
    up((d) => {
      const s = d.sos.find((x) => x.id === sid);
      if (!s.responders.includes(meId)) s.responders.push(meId);
      notify(d, s.by, `${me.name} responded to your SOS`);
    });
    say("You've offered to take the pet. The caregiver has been notified.");
  };

  const resolveSOS = (sid, responderId) => {
    up((d) => {
      const s = d.sos.find((x) => x.id === sid);
      s.status = "resolved"; s.resolvedWith = responderId;
      const old = d.agreements.find((a) => a.id === s.agId);
      old.status = "completed";
      const prev = d.users.find((u) => u.id === old.caregiverId);
      prev.current = Math.max(0, (prev.current || 0) - 1);
      const nr = d.users.find((u) => u.id === responderId);
      nr.current = (nr.current || 0) + 1;
      const nag = { ...old, id: uid("ag"), caregiverId: responderId, start: now(),
        signedOwner: now(), signedCaregiver: now(), status: "active", returnRequested: null, reviews: {} };
      d.agreements.push(nag);
      const pet = d.pets.find((p) => p.id === old.petId);
      d.timeline.push({ id: uid("tl"), petId: old.petId, agId: old.id, kind: "event", text: `Emergency relocation completed — moved to ${nr.name}`, at: now() });
      d.timeline.push({ id: uid("tl"), petId: old.petId, agId: nag.id, kind: "event", text: `Emergency relocation — timeline continues under ${nr.name}`, at: now() });
      notify(d, old.ownerId, `Emergency relocation complete — ${pet.name} is now with ${nr.name}`);
      notify(d, responderId, `You are now caring for ${pet.name}`);
    });
    say("Relocation complete. The timeline continues unbroken.");
  };

  const addExpense = (agId, petId, e) => { up((d) => d.expenses.push({ id: uid("ex"), agId, petId, by: meId, at: now(), reimbursed: false, ...e })); say("Expense logged."); setModal(null); };
  const reimburse = (exId) => {
    up((d) => { const e = d.expenses.find((x) => x.id === exId); e.reimbursed = true; notify(d, e.by, `${me.name} reimbursed ${rupee(e.amount)}`); });
    say("Reimbursed.");
  };

  const book = (petId, agId, a) => {
    up((d) => {
      d.appointments.push({ id: uid("ap"), petId, by: meId, status: "booked", ...a });
      const ag = d.agreements.find((x) => x.id === agId);
      const pet = d.pets.find((p) => p.id === petId);
      if (ag) notify(d, ag.ownerId, `${a.type} booked for ${pet.name} at ${a.clinic}`);
    });
    say("Appointment booked."); setModal(null);
  };

  const aiScan = (petId, agId, photo) => {
    const top = AI_FINDINGS[photo][0];
    if (top[1] <= 0.6 || photo === "🐕") return;
    up((d) => {
      d.timeline.push({ id: uid("tl"), petId, agId, kind: "medical", by: meId, at: now(),
        vet: "AI Health Assistant — screening only, not a diagnosis",
        text: `AI screening flagged: ${top[0]} (${Math.round(top[1] * 100)}% confidence). A vet visit is recommended.` });
      const ag = d.agreements.find((x) => x.id === agId);
      const pet = d.pets.find((p) => p.id === petId);
      if (ag) notify(d, ag.ownerId, `AI health screening flagged a concern for ${pet.name}`);
    });
  };

  const saveProfile = (fields) => {
    up((d) => { Object.assign(d.users.find((u) => u.id === meId), fields); });
    say("Profile saved."); setModal(null);
  };

  /* ── verification actions ── */
  const submitVerify = (payload) => {
    up((d) => d.verifications.push({ id: uid("v"), userId: meId, at: now(), status: "pending", ...payload }));
    say("Documents submitted for review."); setModal(null);
  };

  const decideVerify = (vid, decision, note) => {
    up((d) => {
      const v = d.verifications.find((x) => x.id === vid);
      v.status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "more_info";
      v.adminNote = note || "";
      const u = d.users.find((x) => x.id === v.userId);
      if (decision === "approve") {
        const target = v.kind === "institution" ? u.institutionVerified : u.verified;
        v.checks.forEach((c) => { target[c] = true; });
        u.verifiedAt = now();
      }
      notify(d, v.userId, decision === "approve" ? "Your verification was approved"
        : decision === "reject" ? "Your verification was rejected"
        : `Admin requested more information: ${note || "see your profile for details"}`);
    });
    say(decision === "approve" ? "Verification approved." : decision === "reject" ? "Verification rejected." : "Requested more information.");
  };

  const banUser = (id) => { up((d) => { d.users.find((u) => u.id === id).banned = true; }); say("Account banned. All listings withdrawn."); };
  const clearFlags = (id) => { up((d) => { d.users.find((u) => u.id === id).flags = []; }); say("Flags cleared."); };

  const post = (p) => { up((d) => d.forum.push({ id: uid("f"), by: meId, at: now(), replies: [], ...p })); say("Posted to the community."); setModal(null); };
  const reply = (fid, text) => up((d) => d.forum.find((f) => f.id === fid).replies.push({ by: meId, at: now(), text }));
  const sendMsg = (thread, text) => up((d) => d.messages.push({ id: uid("m"), thread, from: meId, at: now(), text }));
  const readAll = () => up((d) => d.notifications.forEach((n) => { if (n.to === meId) n.read = true; }));

  /* ── trip care actions ── */
  const postTrip = (t) => {
    up((d) => d.tripListings.push({ ...t, id: uid("tp"), ownerId: meId, city: me.city, status: "open", created: now() }));
    say("Trip-care listing posted."); setModal(null); setTab("tripcare");
  };

  const requestTrip = (listingId, note) => {
    up((d) => {
      d.tripRequests.push({ id: uid("trq"), listingId, sitterId: meId, note, status: "pending", created: now() });
      const l = d.tripListings.find((x) => x.id === listingId);
      notify(d, l.ownerId, `${me.name} offered to help with a trip-care visit`);
    });
    say("Request sent to the owner."); setModal(null);
  };

  const acceptTrip = (listingId, sitterId) => {
    const listing = db.tripListings.find((l) => l.id === listingId);
    const cost = tripCost(listing);
    const schedule = tripSchedule(listing);
    const bookingId = uid("tb");
    up((d) => {
      const pet = d.pets.find((p) => p.id === listing.petId);
      d.tripRequests.forEach((r) => { if (r.listingId === listingId) r.status = r.sitterId === sitterId ? "accepted" : "declined"; });
      d.tripListings.find((l) => l.id === listingId).status = "booked";
      d.tripBookings.push({
        id: bookingId, listingId, petId: listing.petId, ownerId: meId, sitterId,
        ratePerVisit: cost.ratePerVisit, totalVisits: cost.totalVisits, totalAmount: cost.totalAmount,
        escrow: "held", releasedAmount: 0, paidAt: now(), releasedAt: null, status: "active",
      });
      schedule.forEach((at, i) => {
        d.visits.push({ id: uid("vis"), bookingId, petId: listing.petId, index: i + 1, scheduledAt: at,
          status: "upcoming", completedAt: null, photo: null, note: "", missedReason: null, by: null });
      });
      notify(d, sitterId, `You've been booked for ${pet.name}'s trip care — ${rupee(cost.totalAmount)} held in escrow`);
    });
    say(`Sitter booked. ${rupee(cost.totalAmount)} held in escrow.`);
  };

  const logVisit = (bookingId, petId, f) => {
    up((d) => {
      const visit = d.visits.find((v) => v.bookingId === bookingId && v.status === "upcoming");
      if (!visit) return;
      visit.status = "done"; visit.completedAt = now(); visit.by = meId; visit.photo = f.photo; visit.note = f.note;
      d.timeline.push({ id: uid("tl"), petId, bookingId, kind: "visit", by: meId, at: now(), photo: f.photo, note: f.note });
      const booking = d.tripBookings.find((b) => b.id === bookingId);
      const pet = d.pets.find((p) => p.id === petId);
      notify(d, booking.ownerId, `${me.name} logged a visit for ${pet.name}`);
    });
    say("Visit logged."); setModal(null);
  };

  const missVisit = (bookingId, petId, reason) => {
    up((d) => {
      const visit = d.visits.find((v) => v.bookingId === bookingId && v.status === "upcoming");
      if (!visit) return;
      visit.status = "missed"; visit.missedReason = reason; visit.by = meId;
      const booking = d.tripBookings.find((b) => b.id === bookingId);
      const pet = d.pets.find((p) => p.id === petId);
      notify(d, booking.ownerId, `${me.name} can't make a visit for ${pet.name}: ${reason}`);
    });
    say("Owner notified."); setModal(null);
  };

  const releaseEscrow = (bookingId) => {
    up((d) => {
      const booking = d.tripBookings.find((b) => b.id === bookingId);
      if (booking && booking.escrow === "held") releaseBookingEscrow(d, booking);
    });
    say("Payment released.");
  };

  const gotoTab = (k) => { setTab(k); setFocus(null); setTripFocus(null); };

  /* ── derived ── */
  const myPets = db.pets.filter((p) => p.ownerId === meId);
  const myListings = db.listings.filter((l) => l.ownerId === meId);
  const openListings = db.listings.filter((l) => l.status === "open");
  const inbound = db.requests.filter((r) => myListings.some((l) => l.id === r.listingId));
  const myAgs = db.agreements.filter((a) => a.ownerId === meId || a.caregiverId === meId);
  const activeSOS = db.sos.filter((s) => s.status === "open");
  const pendingV = db.verifications.filter((v) => v.status === "pending");
  const flaggedUsers = db.users.filter((u) => !u.banned)
    .map((u) => ({ u, signals: [...(u.flags || []), ...detectSignals(db, u)] }))
    .filter((x) => x.signals.length > 0);
  const adoptQueue = db.agreements.filter((a) => a.status === "awaiting_admin");
  const brokenAgs = db.agreements.filter((a) => overdue(db, a) > 0);
  const myTripListings = db.tripListings.filter((l) => l.ownerId === meId);

  const TABS = {
    owner: [["home", "Home", Home], ["pets", "My pets", PawPrint], ["matches", "AI matches", Sparkles], ["timeline", "Pet timeline", Link2],
      ["tripcare", "Trip care", Footprints], ["money", "Expenses & vet", Wallet], ["profile", "My profile", ShieldCheck], ["community", "Community", MessagesSquare]],
    foster: [["home", "Home", Home], ["browse", "Find a pet", Search], ["tripcare", "Trip care", Footprints], ["care", "In my care", Link2],
      ["profile", "My profile", ShieldCheck], ["community", "Community", MessagesSquare]],
    shelter: [["home", "Home", Home], ["browse", "Intake requests", Search], ["care", "In our care", Link2], ["capacity", "Capacity", Building2], ["community", "Community", MessagesSquare]],
    admin: [["verify", "Verification", ShieldCheck], ["fraud", "Fraud & flags", Ban], ["adopt", "Adoption approvals", CalendarCheck], ["sos", "Emergency", Siren], ["stats", "Analytics", BarChart3]],
  }[R];
  const valid = TABS.map((x) => x[0]);
  const T = valid.includes(tab) ? tab : valid[0];
  const badges = {
    matches: inbound.filter((r) => r.status === "pending").length,
    verify: pendingV.length, fraud: flaggedUsers.length,
    adopt: adoptQueue.length, sos: activeSOS.length,
    browse: (R === "foster" || R === "shelter") ? activeSOS.length : 0,
    tripcare: R === "owner"
      ? db.tripRequests.filter((r) => r.status === "pending" && myTripListings.some((l) => l.id === r.listingId)).length
      : R === "foster" ? db.tripListings.filter((l) => l.status === "open").length : 0,
  };

  return (
    <div className="min-h-screen w-full" style={{
      background: `url(/golden-puppy.jpg) center top/cover fixed no-repeat`,
      ...body, color: C.ink,
    }}>
      <style>{FONTS}</style>

      <header className="sticky top-0 z-40 px-4 py-3 sm:px-6" style={{ background: C.ink }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <img src="/logo.jpg" alt="PawBridge" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-base font-extrabold leading-none tracking-tight" style={{ ...display, color: "#fff" }}>PawBridge</p>
              <p className="text-[10px] leading-tight" style={{ color: "#8FA9A0" }}>Helping pets find a safe home when life changes</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { setBell(!bell); if (!bell) setTimeout(readAll, 1500); }}
              className="relative rounded-lg p-2" style={{ background: "#ffffff14", color: "#fff" }}>
              <Bell size={15} />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
                style={{ background: C.danger, color: "#fff", ...mono }}>{unread}</span>}
            </button>
            <span className="hidden text-sm font-semibold sm:inline" style={{ color: "#fff" }}>{me.avatar} {me.name} — {me.role}</span>
            <button onClick={onLogout} className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "#ffffff14", color: "#fff" }}>
              Log out
            </button>
          </div>
        </div>

        {bell && (
          <div className="mx-auto mt-3 max-w-6xl">
            <Card className="max-h-72 overflow-y-auto p-2">
              {myNotifs.length === 0 ? <p className="p-4 text-center text-sm" style={{ color: C.muted }}>Nothing yet.</p>
                : myNotifs.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: n.read ? "transparent" : C.primarySoft }}>
                    <Bell size={13} className="mt-0.5 shrink-0" style={{ color: n.read ? C.muted : C.primary }} />
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: C.ink2 }}>{n.text}</p>
                      <p className="text-xs" style={{ ...mono, color: C.muted }}>{ago(n.at)}</p>
                    </div>
                  </div>
                ))}
            </Card>
          </div>
        )}
      </header>

      <nav className="sticky top-[57px] z-30 overflow-x-auto px-4 sm:px-6" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="mx-auto flex max-w-6xl gap-1">
          {TABS.map(([k, label, I]) => {
            const on = T === k, n = badges[k];
            return (
              <button key={k} onClick={() => gotoTab(k)}
                className="flex shrink-0 items-center gap-1.5 px-3 py-3 text-sm font-semibold"
                style={{ color: on ? C.ink : C.muted, borderBottom: `2px solid ${on ? C.trust : "transparent"}` }}>
                <I size={15} strokeWidth={2.5} />{label}
                {n > 0 && <span className="rounded-full px-1.5 text-[10px] font-bold" style={{ background: C.danger, color: "#fff", ...mono }}>{n}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {focus ? (
          <CareDetail db={db} me={me} ag={db.agreements.find((a) => a.id === focus)} onBack={() => setFocus(null)}
            onReact={react} setModal={setModal} onCountersign={countersign} onReqReturn={reqReturn}
            onConfirmReturn={confirmReturn} onSend={sendMsg} onLogCare={logCare} onReimburse={reimburse} />
        ) : tripFocus ? (
          <TripDetail db={db} me={me} booking={db.tripBookings.find((b) => b.id === tripFocus)} onBack={() => setTripFocus(null)}
            setModal={setModal} onSend={sendMsg} onReleaseEscrow={releaseEscrow} />
        ) : (
          <>
            {T === "home" && (
              <HomeView db={db} me={me} setTab={setTab} setFocus={setFocus}
                myAgs={myAgs} inbound={inbound} activeSOS={activeSOS} onRespondSOS={respondSOS} />
            )}

            {R === "owner" && T === "pets" && (
              <Section title="My pets" sub="The record belongs to the animal. It travels with them to every home."
                action={<Btn icon={Plus} onClick={() => setModal({ t: "pet" })}>Register a pet</Btn>}>
                {myPets.length === 0
                  ? <Empty icon={PawPrint} title="No pets registered" sub="Start with the profile — health, habits, the things only you know."
                      action={<Btn icon={Plus} onClick={() => setModal({ t: "pet" })}>Register a pet</Btn>} />
                  : <div className="grid gap-3 sm:grid-cols-2">
                      {myPets.map((p) => {
                        const listed = db.listings.find((l) => l.petId === p.id && l.status !== "closed");
                        return (
                          <Card key={p.id} className="p-4">
                            <PetHead pet={p} />
                            {p.condition && <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: C.signalSoft, color: C.signal }}>
                              <b>{p.condition}.</b> {p.meds}</div>}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: C.muted }}>
                              <p><b style={{ color: C.ink2 }}>Food</b><br />{p.food}</p>
                              <p><b style={{ color: C.ink2 }}>Activity</b><br />{p.activity}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {[["Kids", p.kids], ["Dogs", p.dogs], ["Cats", p.cats]].map(([k, v]) => (
                                <Pill key={k} icon={v ? Check : X} bg={v ? C.trustSoft : C.paper} fg={v ? C.trust : C.muted}>{k}</Pill>
                              ))}
                              {p.vaccinated && <Pill icon={Syringe} bg={C.trustSoft} fg={C.trust}>Vaccinated</Pill>}
                              {p.collar && <Pill icon={Navigation} bg={C.violetSoft} fg={C.violet}>Smart collar</Pill>}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {listed ? <Pill bg={C.primarySoft} fg={C.primary}>Listed · {listed.status}</Pill>
                                : <Btn size="sm" kind="ghost" icon={Search} onClick={() => setModal({ t: "listing", petId: p.id })}>Find a home</Btn>}
                              <Btn size="sm" kind="ghost" icon={Footprints} onClick={() => setModal({ t: "tripListing", petId: p.id })}>Book a sitter</Btn>
                            </div>
                          </Card>
                        );
                      })}
                    </div>}
              </Section>
            )}

            {R === "owner" && T === "matches" && (
              <Section title="AI matches" sub="Scored on distance, house type, experience, household fit, and availability. Every score is explained.">
                {myListings.length === 0
                  ? <Empty icon={Sparkles} title="Nothing listed yet" sub="List a pet and the recommendation engine will rank every verified caregiver against them." />
                  : myListings.map((l) => {
                      const pet = db.pets.find((p) => p.id === l.petId);
                      const applied = db.requests.filter((r) => r.listingId === l.id);
                      const cands = db.users.filter((u) => (u.role === "foster" || u.role === "shelter") && !u.banned)
                        .map((cg) => ({ cg, m: match(db, l, pet, cg), req: applied.find((r) => r.fosterId === cg.id) }))
                        .sort((a, b) => (b.req ? 1 : 0) - (a.req ? 1 : 0) || b.m.score - a.m.score);
                      return (
                        <div key={l.id} className="mb-8">
                          <Card className="mb-3 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <PetHead pet={pet} />
                              <div className="flex flex-col items-end gap-1.5">
                                <DurTag d={l.duration} />
                                <span className="text-xs" style={{ ...mono, color: C.muted }}>{l.reason} · wants {l.pref}</span>
                              </div>
                            </div>
                            <p className="mt-3 border-l-2 pl-3 text-sm italic leading-relaxed" style={{ borderColor: C.line, color: C.ink2 }}>"{l.note}"</p>
                          </Card>

                          <div className="grid gap-3">
                            {cands.map(({ cg, m, req }) => (
                              <Card key={cg.id} className="p-4" style={req ? { borderColor: C.primary, borderWidth: 1.5 } : {}}>
                                <div className="flex items-start gap-3">
                                  <Ring score={m.score} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-lg">{cg.avatar}</span>
                                      <h4 className="text-base font-extrabold" style={{ ...display }}>{cg.name}</h4>
                                      <VBadge db={db} u={cg} />
                                      {cg.role === "shelter" && <Pill icon={Building2} bg={C.primarySoft} fg={C.primary}>Shelter</Pill>}
                                      {req && <Pill icon={Send} bg={C.primarySoft} fg={C.primary}>Requested · {req.status}</Pill>}
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                                      {m.highlights.map((h) => (
                                        <span key={h} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: C.trust }}>
                                          <Check size={11} strokeWidth={3} />{h}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="mt-1.5 text-xs" style={{ color: C.muted }}>{cg.blurb}</p>
                                    {cg.ratings && cg.ratings.length > 0 && (
                                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        <Stars n={avg(cg.ratings)} />
                                        <span className="text-xs" style={{ ...mono, color: C.muted }}>{avg(cg.ratings).toFixed(1)} · {cg.completed} placements</span>
                                        <Trust score={trustScore(db, cg)} />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {req && <p className="mt-3 rounded-lg p-3 text-sm leading-relaxed" style={{ background: C.paper, color: C.ink2 }}>{req.note}</p>}

                                {!m.eligible && (
                                  <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: C.dangerSoft, color: C.danger }}>
                                    <Ban size={13} className="mt-0.5 shrink-0" />
                                    <span>{TIER_LABEL[m.lvl]} — this placement needs {TIER_LABEL[m.needLvl].toLowerCase()}. They cannot be accepted.</span>
                                  </div>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Btn size="sm" kind="ghost" icon={Eye} onClick={() => setModal({ t: "why", m, cg, pet })}>Why {m.score}%</Btn>
                                  {req && req.status === "pending" && (
                                    <>
                                      <Btn size="sm" kind="trust" icon={FileText} disabled={!m.eligible} onClick={() => setModal({ t: "agreement", rid: req.id })}>Accept & draw up agreement</Btn>
                                      <Btn size="sm" kind="ghost" icon={X} onClick={() => decline(req.id)}>Decline</Btn>
                                    </>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
              </Section>
            )}

            {(R === "foster" || R === "shelter") && T === "browse" && (
              <Section title={R === "shelter" ? "Intake requests" : "Pets who need someone"}
                sub={`Scored against your profile — ${me.city}, ${(me.houseType || "").toLowerCase()}, ${(me.capacity || 0) - (me.current || 0)} place(s) free.`}>
                {activeSOS.length > 0 && (
                  <div className="mb-5">
                    {activeSOS.map((s) => {
                      const pet = db.pets.find((p) => p.id === s.petId);
                      const raiser = db.users.find((u) => u.id === s.by);
                      const done = s.responders.includes(meId);
                      return (
                        <Card key={s.id} className="mb-2 p-4" style={{ background: C.dangerSoft, borderColor: C.danger }}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Flame size={22} style={{ color: C.danger }} />
                              <div>
                                <p className="text-base font-extrabold" style={{ ...display, color: C.danger }}>Emergency relocation — {pet.emoji} {pet.name}</p>
                                <p className="text-xs" style={{ color: C.danger }}>{raiser.name} can no longer continue: {s.reason} · {ago(s.at)}</p>
                              </div>
                            </div>
                            {done ? <Pill icon={Check} bg="#fff" fg={C.danger}>You've offered</Pill>
                              : <Btn size="sm" kind="danger" icon={Siren} onClick={() => respondSOS(s.id)}>I can take {pet.name}</Btn>}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {openListings.length === 0
                  ? <Empty icon={Search} title="Nothing open right now" sub="New listings appear here, scored against your home." />
                  : <div className="grid gap-3">
                      {openListings.map((l) => {
                        const pet = db.pets.find((p) => p.id === l.petId);
                        const owner = db.users.find((u) => u.id === l.ownerId);
                        const m = match(db, l, pet, me);
                        const req = db.requests.find((r) => r.listingId === l.id && r.fosterId === meId);
                        return (
                          <Card key={l.id} className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <PetHead pet={pet} />
                              <div className="flex items-center gap-3">
                                <DurTag d={l.duration} />
                                <Ring score={m.score} size={48} />
                              </div>
                            </div>
                            <p className="mt-3 border-l-2 pl-3 text-sm italic leading-relaxed" style={{ borderColor: C.line, color: C.ink2 }}>
                              "{l.note}" <span className="not-italic" style={{ color: C.muted }}>— {owner.name}, {l.city} · {m.dist} km · {l.reason}</span>
                            </p>
                            {pet.condition && <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: C.signalSoft, color: C.signal }}>
                              <b>{pet.condition}.</b> {pet.meds}</div>}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Btn size="sm" kind="ghost" icon={Eye} onClick={() => setModal({ t: "why", m, cg: me, pet })}>Why {m.score}%</Btn>
                              {req ? <Pill bg={C.primarySoft} fg={C.primary}>Request {req.status}</Pill>
                                : m.eligible ? <Btn size="sm" icon={Send} onClick={() => setModal({ t: "apply", listingId: l.id, pet, l })}>Offer to help</Btn>
                                  : <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.danger }}>
                                      <Ban size={13} /> Needs {TIER_LABEL[m.needLvl].toLowerCase()} — you're {TIER_LABEL[m.lvl].toLowerCase()}
                                    </span>}
                            </div>
                          </Card>
                        );
                      })}
                    </div>}
              </Section>
            )}

            {(T === "care" || T === "timeline") && (
              <Section title={R === "owner" ? "Pet timeline" : "In my care"}
                sub="Append-only. Nothing here can be edited or deleted — not by you, not by the owner, not by us.">
                {myAgs.length === 0
                  ? <Empty icon={Link2} title="No timelines yet" sub="A timeline begins the moment a digital agreement is signed by both parties." />
                  : <div className="grid gap-3">
                      {myAgs.map((ag) => {
                        const pet = db.pets.find((p) => p.id === ag.petId);
                        const other = db.users.find((u) => u.id === (meId === ag.ownerId ? ag.caregiverId : ag.ownerId));
                        const od = overdue(db, ag);
                        const n = db.timeline.filter((x) => x.agId === ag.id && x.kind === "update").length;
                        return (
                          <Card key={ag.id} className="cursor-pointer p-4 transition-all hover:shadow-md" onClick={() => setFocus(ag.id)}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <PetHead pet={pet} />
                              <div className="flex flex-col items-end gap-1.5">
                                {ag.status === "awaiting_admin" ? <Pill icon={Clock} bg={C.violetSoft} fg={C.violet}>Awaiting admin approval</Pill>
                                  : ag.status === "awaiting_signature" ? <Pill icon={PenLine} bg={C.signalSoft} fg={C.signal}>Awaiting signature</Pill>
                                    : od > 0 ? <Pill icon={AlertTriangle} bg={C.dangerSoft} fg={C.danger}>Timeline broken · {od}d</Pill>
                                      : ag.status === "completed" ? <Pill icon={Check} bg={C.paper} fg={C.muted}>Completed</Pill>
                                        : <Pill icon={Link2} bg={C.trustSoft} fg={C.trust}>Intact · {n} updates</Pill>}
                                <span className="text-xs" style={{ ...mono, color: C.muted }}>with {other.name}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs" style={{ ...mono, color: C.muted }}>
                                {DURATIONS[ag.duration].label} · {fmt(ag.start)}{ag.end ? ` → ${fmt(ag.end)}` : " → permanent"}
                              </span>
                              <ChevronRight size={16} style={{ color: C.muted }} />
                            </div>
                          </Card>
                        );
                      })}
                    </div>}
              </Section>
            )}

            {R === "owner" && T === "money" && <MoneyView db={db} me={me} onReimburse={reimburse} />}
            {(R === "foster" || R === "owner") && T === "profile" && <ProfileView db={db} me={me} setModal={setModal} />}

            {R === "owner" && T === "tripcare" && (
              <TripCareView db={db} me={me} onAcceptTrip={acceptTrip} onOpenBooking={setTripFocus} />
            )}
            {R === "foster" && T === "tripcare" && (
              <TripBrowseView db={db} me={me}
                onApply={(l) => setModal({ t: "tripApply", listing: l, pet: db.pets.find((p) => p.id === l.petId) })}
                onOpenBooking={setTripFocus} />
            )}

            {R === "shelter" && T === "capacity" && (
              <Section title="Capacity" sub="Published live. When no individual foster matches, listings surface to shelters with room.">
                <Card className="p-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-5xl font-extrabold leading-none" style={{ ...display, color: C.ink }}>
                        {me.current}<span style={{ color: C.muted }}>/{me.capacity}</span>
                      </p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: C.muted }}>animals in care</p>
                    </div>
                    <div className="text-right text-xs" style={{ ...mono, color: C.muted }}>
                      <p>Reg. {me.registration}</p>
                      <p>{me.medicalStaff}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: C.line }}>
                    <div className="h-full rounded-full" style={{ width: `${(me.current / me.capacity) * 100}%`, background: me.current / me.capacity > 0.85 ? C.danger : C.trust }} />
                  </div>
                  <p className="mt-3 text-sm" style={{ color: C.muted }}>
                    {me.capacity - me.current} places free. You are the fallback for {openListings.length} open listing(s) in {me.city}.
                  </p>
                </Card>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Stat k="Adoptions completed" v={me.completed} col={C.trust} icon={Trophy} />
                  <Stat k="Average rating" v={avg(me.ratings).toFixed(1)} col={C.signal} icon={Star} />
                  <Stat k="Emergency intakes" v={db.sos.filter((s) => s.resolvedWith === meId).length} col={C.danger} icon={Siren} />
                </div>
              </Section>
            )}

            {T === "community" && <CommunityView db={db} onPost={() => setModal({ t: "post" })} onReply={reply} />}

            {R === "admin" && T === "verify" && (
              <Section title="Verification queue" sub="A badge is only worth what the review behind it is worth.">
                {pendingV.length === 0 ? <Empty icon={ShieldCheck} title="Queue is clear" sub="No verifications waiting." />
                  : pendingV.map((v) => {
                      const u = db.users.find((x) => x.id === v.userId);
                      const checksMap = v.kind === "institution" ? INSTITUTION_CHECKS : v.tier === "light" ? LIGHT_CHECKS : DEEP_CHECKS;
                      const dupes = addressReuse(db, u.id).map((id) => db.users.find((x) => x.id === id)).filter(Boolean);
                      const confidence = selfieConfidence(v.id);
                      return (
                        <Card key={v.id} className="mb-3 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{u.avatar}</span>
                              <div>
                                <p className="font-extrabold" style={{ ...display }}>{u.name}</p>
                                <p className="text-xs" style={{ color: C.muted }}>
                                  {u.city} · {u.houseType || u.registration} · applying for {v.kind === "institution" ? "institution verification" : TIER_LABEL[v.tier]}
                                </p>
                              </div>
                            </div>
                            <Pill icon={Clock} bg={C.signalSoft} fg={C.signal}>Submitted {ago(v.at)}</Pill>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {v.checks.map((c) => {
                              const I = checksMap[c].icon;
                              return <span key={c} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                                style={{ background: C.paper, color: C.ink2, ...mono }}><I size={11} />{checksMap[c].label}</span>;
                            })}
                          </div>
                          {v.kind !== "institution" && v.checks.includes("selfie") && (
                            <p className="mt-3 text-xs font-semibold" style={{ color: confidence < 70 ? C.danger : C.muted }}>
                              Selfie-to-ID match confidence: {confidence}%{confidence < 70 ? " — below the auto-approve threshold, review manually" : ""}
                            </p>
                          )}
                          {dupes.length > 0 && (
                            <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold" style={{ color: C.danger }}>
                              <Users size={12} className="mt-0.5 shrink-0" /> Shares an address with {dupes.map((d) => d.name).join(", ")}
                            </p>
                          )}
                          <p className="mt-3 text-xs" style={{ color: C.muted }}>Documents are encrypted, visible only here, and purged 90 days after a decision.</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Btn size="sm" kind="trust" icon={Check} onClick={() => decideVerify(v.id, "approve")}>Approve</Btn>
                            <Btn size="sm" kind="ghost" icon={HelpCircle} onClick={() => decideVerify(v.id, "more_info", "Please resubmit clearer documents")}>Request more info</Btn>
                            <Btn size="sm" kind="ghost" icon={X} onClick={() => decideVerify(v.id, "reject")}>Reject</Btn>
                          </div>
                        </Card>
                      );
                    })}

                {brokenAgs.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-3 text-lg font-extrabold" style={{ ...display, color: C.danger }}>Broken timelines</h3>
                    {brokenAgs.map((ag) => {
                      const pet = db.pets.find((p) => p.id === ag.petId);
                      const cg = db.users.find((u) => u.id === ag.caregiverId);
                      return (
                        <Card key={ag.id} className="mb-2 p-4" style={{ borderColor: C.danger + "44" }}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{pet.emoji}</span>
                              <div>
                                <p className="font-extrabold" style={{ ...display }}>{pet.name} · with {cg.name}</p>
                                <p className="text-xs" style={{ color: C.danger }}>{overdue(db, ag)} days past the agreed {ag.cadence}-day cadence</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Trust score={trustScore(db, cg)} />
                              <Btn size="sm" kind="ghost" icon={MessageSquare} onClick={() => say("Caregiver contacted. Escalation logged.")}>Escalate</Btn>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Section>
            )}

            {R === "admin" && T === "fraud" && (
              <Section title="Fraud & flags" sub="Duplicate listings, ID/selfie mismatch, banned-address reuse, suspicious request velocity.">
                {flaggedUsers.length === 0 ? <Empty icon={ShieldCheck} title="No flags" sub="Fraud detection has nothing to show you." />
                  : flaggedUsers.map(({ u, signals }) => (
                      <Card key={u.id} className="mb-3 p-4" style={{ borderColor: C.danger + "55" }}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{u.avatar}</span>
                            <div>
                              <p className="font-extrabold" style={{ ...display }}>{u.name}</p>
                              <p className="text-xs" style={{ ...mono, color: C.muted }}>{u.email} · {u.city} · {TIER_LABEL[effectiveTier(db, u)]}</p>
                            </div>
                          </div>
                          <Pill icon={AlertTriangle} bg={C.dangerSoft} fg={C.danger}>{signals.length} signal{signals.length === 1 ? "" : "s"}</Pill>
                        </div>
                        <p className="mt-3 rounded-lg p-3 text-sm italic" style={{ background: C.paper, color: C.ink2 }}>"{u.blurb}"</p>
                        <div className="mt-3 space-y-1.5">
                          {signals.map((f, i) => (
                            <p key={i} className="flex items-start gap-2 text-xs font-semibold" style={{ color: C.danger }}>
                              <AlertTriangle size={12} className="mt-0.5 shrink-0" />{f}
                            </p>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Btn size="sm" kind="danger" icon={Ban} onClick={() => banUser(u.id)}>Ban account</Btn>
                          <Btn size="sm" kind="ghost" icon={Check} onClick={() => clearFlags(u.id)}>Clear flags</Btn>
                        </div>
                      </Card>
                    ))}
              </Section>
            )}

            {R === "admin" && T === "adopt" && (
              <Section title="Adoption approvals" sub="No permanent transfer of custody completes without a human signing off on it.">
                {adoptQueue.length === 0 ? <Empty icon={CalendarCheck} title="Nothing awaiting approval" sub="Adoptions accepted by owners land here first." />
                  : adoptQueue.map((ag) => {
                      const pet = db.pets.find((p) => p.id === ag.petId);
                      const owner = db.users.find((u) => u.id === ag.ownerId);
                      const cg = db.users.find((u) => u.id === ag.caregiverId);
                      return (
                        <Card key={ag.id} className="mb-3 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <PetHead pet={pet} />
                            <Pill icon={Clock} bg={C.violetSoft} fg={C.violet}>Permanent transfer</Pill>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {[[owner, "Giving up custody"], [cg, "Taking custody"]].map(([u, role]) => (
                              <div key={u.id} className="rounded-lg p-3" style={{ background: C.paper }}>
                                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{role}</p>
                                <p className="mt-0.5 font-bold" style={{ color: C.ink }}>{u.avatar} {u.name}</p>
                                <div className="mt-1.5"><VBadge db={db} u={u} /></div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Btn size="sm" kind="trust" icon={Check} onClick={() => approveAdoption(ag.id, true)}>Approve adoption</Btn>
                            <Btn size="sm" kind="ghost" icon={X} onClick={() => approveAdoption(ag.id, false)}>Decline</Btn>
                          </div>
                        </Card>
                      );
                    })}
              </Section>
            )}

            {R === "admin" && T === "sos" && (
              <Section title="Emergency cases" sub="Every SOS is broadcast to verified caregivers in range and to the nearest shelter with capacity.">
                {db.sos.length === 0 ? <Empty icon={Siren} title="No emergencies" sub="Nothing has been raised." />
                  : db.sos.map((s) => {
                      const pet = db.pets.find((p) => p.id === s.petId);
                      const by = db.users.find((u) => u.id === s.by);
                      return (
                        <Card key={s.id} className="mb-3 p-4" style={{ borderColor: s.status === "open" ? C.danger : C.line }}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{pet.emoji}</span>
                              <div>
                                <p className="font-extrabold" style={{ ...display }}>{pet.name}</p>
                                <p className="text-xs" style={{ color: C.muted }}>Raised by {by.name} · {s.reason} · {ago(s.at)}</p>
                              </div>
                            </div>
                            <Pill icon={s.status === "open" ? Flame : Check} bg={s.status === "open" ? C.dangerSoft : C.trustSoft}
                              fg={s.status === "open" ? C.danger : C.trust}>{s.status}</Pill>
                          </div>
                          <p className="mt-3 text-xs" style={{ ...mono, color: C.muted }}>{s.responders.length} responder(s)</p>
                        </Card>
                      );
                    })}
              </Section>
            )}

            {R === "admin" && T === "stats" && <AnalyticsView db={db} />}
          </>
        )}
      </main>

      {modal && modal.t === "pet" && <PetModal onClose={() => setModal(null)} onSave={addPet} />}
      {modal && modal.t === "listing" && <ListingModal pet={db.pets.find((p) => p.id === modal.petId)} onClose={() => setModal(null)} onSave={publish} />}
      {modal && modal.t === "apply" && <ApplyModal pet={modal.pet} l={modal.l} onClose={() => setModal(null)} onSend={(n) => request(modal.listingId, n)} />}
      {modal && modal.t === "why" && <WhyModal m={modal.m} cg={modal.cg} pet={modal.pet} onClose={() => setModal(null)} />}
      {modal && modal.t === "agreement" && <AgreementModal db={db} me={me} rid={modal.rid} onClose={() => setModal(null)} onSign={sign} />}
      {modal && modal.t === "update" && <UpdateModal pet={db.pets.find((p) => p.id === modal.petId)} onClose={() => setModal(null)} onPost={(u) => postUpdate(modal.agId, modal.petId, u)} />}
      {modal && modal.t === "rate" && <RateModal other={modal.other} onClose={() => setModal(null)} onSave={(r, x) => rate(modal.agId, r, x)} />}
      {modal && modal.t === "verify" && <VerifyModal me={me} onClose={() => setModal(null)} onSubmit={submitVerify} />}
      {modal && modal.t === "sos" && <SOSModal pet={modal.pet} onClose={() => setModal(null)} onRaise={(r) => raiseSOS(modal.agId, r)} />}
      {modal && modal.t === "ai" && <AIModal pet={modal.pet} onClose={() => setModal(null)} onLog={(photo) => aiScan(modal.petId, modal.agId, photo)}
        onBook={() => setModal({ t: "book", petId: modal.petId, agId: modal.agId, pet: modal.pet })} />}
      {modal && modal.t === "book" && <BookModal pet={modal.pet} onClose={() => setModal(null)} onBook={(a) => book(modal.petId, modal.agId, a)} />}
      {modal && modal.t === "expense" && <ExpenseModal pet={modal.pet} cap={modal.cap} onClose={() => setModal(null)} onSave={(e) => addExpense(modal.agId, modal.petId, e)} />}
      {modal && modal.t === "post" && <PostModal onClose={() => setModal(null)} onSave={post} />}
      {modal && modal.t === "gps" && <GPSModal pet={modal.pet} onClose={() => setModal(null)} />}
      {modal && modal.t === "sosResolve" && <ResolveModal db={db} s={modal.s} onClose={() => setModal(null)} onPick={(rid) => { resolveSOS(modal.s.id, rid); setModal(null); }} />}
      {modal && modal.t === "tripListing" && <TripListingModal pet={db.pets.find((p) => p.id === modal.petId)} onClose={() => setModal(null)} onSave={postTrip} />}
      {modal && modal.t === "tripApply" && <TripApplyModal pet={modal.pet} listing={modal.listing} onClose={() => setModal(null)} onSend={(n) => requestTrip(modal.listing.id, n)} />}
      {modal && modal.t === "logVisit" && <LogVisitModal pet={modal.pet} onClose={() => setModal(null)} onLog={(f) => logVisit(modal.bookingId, modal.petId, f)} />}
      {modal && modal.t === "missVisit" && <MissVisitModal pet={modal.pet} onClose={() => setModal(null)} onMiss={(r) => missVisit(modal.bookingId, modal.petId, r)} />}
      {modal && modal.t === "completeProfile" && <CompleteProfileModal me={me} onClose={() => setModal(null)} onSave={saveProfile} />}

      {toast && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-lg"
        style={{ background: C.ink, color: "#fff", ...body }}>{toast}</div>}
    </div>
  );
}
