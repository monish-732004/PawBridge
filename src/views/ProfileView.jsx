import { Clock, ShieldCheck, Upload, Check, AlertTriangle } from "lucide-react";
import { C, display, mono, avg } from "../constants.js";
import { tierOf, LIGHT_CHECKS, DEEP_CHECKS, TIER_LABEL, TIER_UNLOCK, TRUST_REVERIFY_THRESHOLD } from "../data.js";
import { updateStats, trustScore, effectiveTier } from "../logic.js";
import { Section, Card, Pill, Btn, VBadge, Trust, Stars } from "../primitives.jsx";

export default function ProfileView({ db, me, setModal }) {
  const stored = tierOf(me);
  const tier = effectiveTier(db, me);
  const pending = db.verifications.find((v) => v.userId === me.id && v.status === "pending");
  const score = trustScore(db, me);
  const trustDue = score !== null && score < TRUST_REVERIFY_THRESHOLD;
  const reverifyDue = tier !== stored;
  const st = me.role === "foster" ? updateStats(db, me.id) : null;
  const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const checks = { ...LIGHT_CHECKS, ...DEEP_CHECKS };
  const checkKeys = Object.keys(checks).filter((k) => k !== "noc" || me.renting);

  return (
    <Section title="My profile" sub="No badge on PawBridge is self-declared. Every one of them maps to a document a human read.">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{me.avatar}</span>
            <div>
              <h4 className="text-lg font-extrabold" style={{ ...display }}>{me.name}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <VBadge db={db} u={me} />
                {score !== null && <Trust score={score} />}
                {me.ratings && me.ratings.length > 0 && <Stars n={avg(me.ratings)} />}
              </div>
            </div>
          </div>
          {pending ? <Pill icon={Clock} bg={C.signalSoft} fg={C.signal}>Under review</Pill>
            : tier === "deep" ? <Pill icon={ShieldCheck} bg={C.trustSoft} fg={C.trust}>Fully verified</Pill>
              : <Btn icon={Upload} onClick={() => setModal({ t: "verify" })}>Submit documents</Btn>}
        </div>

        {reverifyDue && (
          <div className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs leading-relaxed" style={{ background: C.dangerSoft, color: C.danger }}>
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              Re-verification needed — {trustDue
                ? "your trust score has dropped, so every tier is on hold until an admin reviews you again."
                : "your last approval is over 12 months old."} Your documents are still on file at {TIER_LABEL[stored].toLowerCase()},
              but you're currently limited to {TIER_UNLOCK[tier].toLowerCase()} until it's re-reviewed.
            </span>
          </div>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {checkKeys.map((k) => {
            const has = me.verified && me.verified[k];
            const I = checks[k].icon;
            return (
              <div key={k} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: has ? C.trustSoft : C.paper }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: has ? C.trust : C.line }}>
                  {has ? <Check size={13} color="#fff" strokeWidth={3} /> : <I size={13} style={{ color: C.muted }} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: has ? C.trust : C.ink }}>{checks[k].label}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{has ? "Verified" : "Not submitted"}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg p-3 text-xs" style={{ background: C.paper, color: C.muted }}>
          <b style={{ color: C.ink2 }}>{TIER_LABEL[tier]}</b> — unlocks {TIER_UNLOCK[tier].toLowerCase()}.
          {tier !== "deep" && ` Next up: ${TIER_UNLOCK[tier === "none" ? "light" : "deep"].toLowerCase()}.`}
        </div>
      </Card>

      {me.role === "foster" && (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-extrabold" style={{ ...display }}>My home</p>
              <Btn size="sm" kind="ghost" onClick={() => setModal({ t: "completeProfile" })}>Edit</Btn>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["House type", me.houseType], ["Experience", `${me.experience} years`],
                ["Pets owned", me.petsOwned], ["Kids at home", me.kids ? "Yes" : "No"],
                ["Other pets", me.otherPets ? "Yes" : "No"], ["Alone per day", `${me.workingHours} hours`],
                ["Capacity", `${me.current} / ${me.capacity}`], ["Species", (me.species || []).join(", ")]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{k}</p>
                  <p className="font-semibold" style={{ color: C.ink }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {["Home photos", "Garden", "Pet area"].map((x) => (
                <div key={x} className="flex h-16 flex-1 flex-col items-center justify-center rounded-lg text-xs font-semibold"
                  style={{ background: C.paper, color: C.muted }}>
                  <Upload size={14} className="mb-1" />{x}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-1 text-sm font-extrabold" style={{ ...display }}>Availability calendar</p>
            <p className="mb-3 text-xs" style={{ color: C.muted }}>Owners only see you if you're free for the whole term they need.</p>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => {
                const free = me.availability && me.availability[m];
                return (
                  <div key={m} className="rounded-lg py-3 text-center"
                    style={{ background: free ? C.trustSoft : C.dangerSoft, border: `1px solid ${free ? C.trust : C.danger}44` }}>
                    <p className="text-sm font-extrabold" style={{ ...display, color: free ? C.trust : C.danger }}>{m}</p>
                    <p className="text-[10px] font-semibold" style={{ color: free ? C.trust : C.danger }}>{free ? "Available" : "Unavailable"}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg p-3" style={{ background: C.paper }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Trust score, broken down</p>
              <div className="mt-2 space-y-1 text-xs" style={{ ...mono, color: C.ink2 }}>
                <p>Verification · {Math.round(40 * (stored === "deep" ? 1 : stored === "light" ? 0.5 : 0))} / 40</p>
                <p>Ratings · {Math.round(30 * (me.ratings && me.ratings.length ? avg(me.ratings) / 5 : 0.6))} / 30</p>
                <p>Updates on time · {Math.round(30 * st.rate)} / 30 ({st.on}/{st.due})</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: C.muted }}>
                Miss the cadence you agreed to and the last number falls, in real time. That is the point of it.
              </p>
            </div>
          </Card>
        </div>
      )}
    </Section>
  );
}
