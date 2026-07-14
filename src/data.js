import {
  Utensils, Syringe, Stethoscope, PawPrint, Footprints, Sparkles,
  Fingerprint, ScanLine, Home, ShieldCheck, Phone, Mail, FileText, UserCheck,
  Building2, BadgeCheck, ClipboardCheck,
} from "lucide-react";

export const REASONS = ["Job Transfer", "Moving Abroad", "College", "Financial Issues", "Temporary Travel", "Health Issues", "Other"];

export const DURATIONS = {
  m1:    { label: "1 month",  months: 1,    permanent: false },
  m3:    { label: "3 months", months: 3,    permanent: false },
  m6:    { label: "6 months", months: 6,    permanent: false },
  adopt: { label: "Adoption", months: null, permanent: true  },
};

export const PREFERENCES = ["Foster Family", "Shelter", "Adoption Centre", "Individual Caregiver"];

export const EXPENSE_CATS = {
  food:        Utensils,
  medicine:    Syringe,
  vet:         Stethoscope,
  accessories: PawPrint,
};

export const FORUM_CATS = ["Lost Pets", "Training Tips", "Nutrition", "Adoption Success Stories"];

export const MOODS = {
  thriving:  { label: "Thriving",  color: "#1F6F5C" },
  settled:   { label: "Settled",   color: "#27508F" },
  adjusting: { label: "Adjusting", color: "#B37010" },
  unwell:    { label: "Unwell",    color: "#A93544" },
};

export const CARE_ACTS = {
  fed:   { label: "Fed",              icon: Utensils  },
  walk:  { label: "Walked",           icon: Footprints },
  meds:  { label: "Medication given", icon: Syringe   },
  groom: { label: "Groomed",          icon: Sparkles  },
};

export const AI_FINDINGS = {
  "🐕": [["Healthy coat and clear eyes", 0.94], ["No visible lameness", 0.88]],
  "👁️": [["Eye infection — conjunctival redness and discharge", 0.87], ["Possible corneal irritation", 0.41]],
  "🩹": [["Skin disease — localised hair loss, likely mange or dermatitis", 0.82], ["Secondary bacterial infection", 0.55]],
  "🦵": [["Limping — reduced weight-bearing on the right hind limb", 0.79], ["Joint inflammation", 0.48]],
  "👂": [["Ear infection — discharge and inflammation of the canal", 0.84], ["Ear mites", 0.37]],
  "📉": [["Weight loss — visible rib and spine definition", 0.76], ["Possible parasite load", 0.44]],
};

export const AI_LABELS = {
  "🐕": "Full body",
  "👁️": "Eye close-up",
  "🩹": "Skin patch",
  "🦵": "Gait video",
  "👂": "Ear close-up",
  "📉": "Body condition",
};

/* ═══ VERIFICATION TIERS ══════════════════════════════════════
   Light: browse, message, apply for trip-care visits.
   Deep:  required before any unsupervised custody transfer —
          fostering, adoption, or overnight boarding.
   Institutions (shelters) walk a separate registration-based
   path rather than the individual document checklist. ═══════ */

export const LIGHT_CHECKS = {
  phone:  { label: "Phone (OTP verified)",     icon: Phone },
  email:  { label: "Email verified",           icon: Mail },
  govId:  { label: "Government ID upload",     icon: Fingerprint },
  selfie: { label: "Liveness-checked selfie",  icon: ScanLine },
};

export const DEEP_CHECKS = {
  address:   { label: "Address proof",              icon: Home },
  noc:       { label: "Landlord NOC (if renting)",   icon: FileText },
  police:    { label: "Police clearance certificate", icon: ShieldCheck },
  reference: { label: "Vet or personal reference",    icon: UserCheck },
};

export const INSTITUTION_CHECKS = {
  registration:    { label: "Registration certificate", icon: FileText },
  license:         { label: "Operating license number", icon: BadgeCheck },
  facilityAddress: { label: "Facility address proof",   icon: Building2 },
  inspection:      { label: "One-time inspection sign-off", icon: ClipboardCheck },
};

export const TIER_LABEL = {
  none:  "Unverified",
  light: "Light verified",
  deep:  "Deep verified",
};

export const TIER_UNLOCK = {
  none:  "Browse only",
  light: "Messaging & trip-care visits",
  deep:  "Fostering, adoption & overnight boarding",
};

export const TRUST_REVERIFY_THRESHOLD = 50;

/* Stored tier for an individual (owner/foster), ignoring reverification lapses. */
export function tierOf(u) {
  const v = u.verified || {};
  const lightOk = Object.keys(LIGHT_CHECKS).every((k) => v[k]);
  if (!lightOk) return "none";
  const deepChecks = Object.keys(DEEP_CHECKS).filter((k) => k !== "noc" || u.renting);
  const deepOk = deepChecks.every((k) => v[k]);
  return deepOk ? "deep" : "light";
}

/* Stored tier for an institution (shelter), via its own registration-based path. */
export function institutionTierOf(u) {
  const v = u.institutionVerified || {};
  const ok = Object.keys(INSTITUTION_CHECKS).every((k) => v[k]);
  return ok ? "deep" : "none";
}

/* ═══ TRIP CARE / DROP-IN VISITS ═══════════════════════════════ */

export const TRIP_FREQUENCIES = ["1x daily", "2x daily", "3x daily"];

export const TRIP_TASKS = {
  feeding:    { label: "Feeding",    icon: Utensils   },
  walking:    { label: "Walking",    icon: Footprints },
  medication: { label: "Medication", icon: Syringe    },
  playtime:   { label: "Playtime",   icon: Sparkles   },
};
