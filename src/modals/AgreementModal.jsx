import { useState } from "react";
import { PenLine, Navigation } from "lucide-react";
import { C, display, mono, fmt, rupee, DAY } from "../constants.js";
import { DURATIONS, TIER_LABEL } from "../data.js";
import { effectiveTier } from "../logic.js";
import { Modal, Field, Sel, Input, Btn } from "../primitives.jsx";

export default function AgreementModal({ db, me, rid, onClose, onSign }) {
  const rq = db.requests.find((r) => r.id === rid);
  const l = db.listings.find((x) => x.id === rq.listingId);
  const pet = db.pets.find((p) => p.id === l.petId);
  const cg = db.users.find((u) => u.id === rq.fosterId);
  const dur = DURATIONS[l.duration];
  const [cadence, setCadence] = useState(7);
  const [stipend, setStipend] = useState(dur.permanent ? 0 : 4000);
  const [medicalCap, setCap] = useState(5000);
  const [gps, setGps] = useState(!!pet.collar);
  const [sig, setSig] = useState("");
  const ok = sig.trim().toLowerCase() === me.name.toLowerCase();

  return (
    <Modal title="Digital agreement" onClose={onClose} wide>
      <div className="rounded-xl p-5" style={{ background: C.paper }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ ...mono, color: C.muted }}>PawBridge · Digital Care Agreement</p>
        <h4 className="mt-1 text-lg font-extrabold" style={{ ...display, color: C.ink }}>
          {pet.name} · {dur.permanent ? "Permanent adoption" : `${dur.label} foster`}
        </h4>
        <div className="mt-3 space-y-1.5 text-sm" style={{ color: C.ink2 }}>
          <p><b>Owner:</b> {me.name}</p>
          <p><b>Caregiver:</b> {cg.name} — {TIER_LABEL[effectiveTier(db, cg)]}, {cg.houseType}</p>
          <p><b>Care duration:</b> {fmt(l.start)} {dur.permanent ? "— permanent" : `to ${fmt(l.start + dur.months * 30 * DAY)}`}</p>
          <p><b>Ownership rights:</b> {dur.permanent ? "Custody transfers to the caregiver on completion, subject to admin approval." : "Owner retains full legal custody throughout."}</p>
          <p><b>Return conditions:</b> {dur.permanent ? "The pet is not returned. Update rights continue for the agreed window." : "Either party may end this arrangement with 14 days' written notice."}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Update cadence"><Sel value={cadence} onChange={(e) => setCadence(+e.target.value)}>
          <option value={3}>Every 3 days</option><option value={7}>Every 7 days</option>
          <option value={14}>Every 14 days</option><option value={30}>Every 30 days</option></Sel></Field>
        <Field label="Monthly stipend (₹)"><Input type="number" value={stipend} onChange={(e) => setStipend(+e.target.value)} /></Field>
        <Field label="Medical expense cap (₹)"><Input type="number" value={medicalCap} onChange={(e) => setCap(+e.target.value)} /></Field>
      </div>

      {pet.collar && (
        <label className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold"
          style={{ background: C.violetSoft, color: C.violet }}>
          <input type="checkbox" checked={gps} onChange={(e) => setGps(e.target.checked)} />
          <Navigation size={14} /> Enable GPS tracking via {pet.name}'s smart collar — {cg.name} sees exactly what you see.
        </label>
      )}

      <div className="mt-4 space-y-2 rounded-xl p-4 text-xs leading-relaxed" style={{ background: C.trustSoft, color: C.trust }}>
        <p>· {cg.name} commits to posting an update at least every {cadence} days. Missed updates appear on the timeline and reduce their trust score.</p>
        <p>· Medical costs up to {rupee(medicalCap)} are met by the caregiver. Above that, {me.name} must be consulted before treatment is authorised.</p>
        <p>· Emergency SOS is available to either party at any time. The pet is never left without a plan.</p>
        <p>· If {me.name} becomes unreachable for 60 days, custody passes to {cg.name} and admin is notified.</p>
        <p>· The timeline is append-only. Neither party, nor PawBridge, can edit or delete it.</p>
        {dur.permanent && <p>· This adoption does not complete until an administrator has approved it.</p>}
      </div>

      <div className="mt-4">
        <Field label={`Type your full name to sign — "${me.name}"`}>
          <Input value={sig} onChange={(e) => setSig(e.target.value)} placeholder={me.name} />
        </Field>
        <p className="mt-1 text-xs" style={{ color: C.muted }}>
          Signing records your name, the timestamp, and your IP address. {cg.name} must countersign before {pet.name} is handed over.
        </p>
      </div>
      <div className="mt-4">
        <Btn full kind="trust" icon={PenLine} disabled={!ok} onClick={() => onSign(rid, { cadence, stipend, medicalCap, gps })}>Sign agreement</Btn>
      </div>
    </Modal>
  );
}
