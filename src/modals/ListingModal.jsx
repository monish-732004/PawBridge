import { useState } from "react";
import { C, display, now, DAY } from "../constants.js";
import { REASONS, DURATIONS, PREFERENCES, TIER_LABEL } from "../data.js";
import { Modal, Field, Sel, Input, Area, Btn } from "../primitives.jsx";

export default function ListingModal({ pet, onClose, onSave }) {
  const [dur, setDur] = useState("m6");
  const [f, setF] = useState({ reason: REASONS[0], pref: PREFERENCES[0], note: "", start: new Date(now() + 14 * DAY).toISOString().slice(0, 10) });
  const s = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title={`Find a home for ${pet.name}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Duration</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(DURATIONS).map((k) => {
              const v = DURATIONS[k];
              const on = dur === k;
              return (
                <button key={k} onClick={() => setDur(k)} className="rounded-xl p-3 text-center"
                  style={{ background: on ? (v.permanent ? C.signalSoft : C.trustSoft) : C.paper,
                    border: `1.5px solid ${on ? (v.permanent ? C.signal : C.trust) : "transparent"}` }}>
                  <p className="text-sm font-extrabold" style={{ ...display, color: on ? (v.permanent ? C.signal : C.trust) : C.ink }}>{v.label}</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>{v.permanent ? "Permanent" : "Temporary"}</p>
                </button>
              );
            })}
          </div>
        </div>

        {dur === "adopt" && (
          <div className="rounded-xl p-4" style={{ background: C.signalSoft }}>
            <p className="text-sm font-extrabold" style={{ ...display, color: C.signal }}>
              Before you give {pet.name} up — is there any version of this where you keep {pet.gender === "Female" ? "her" : "him"}?
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: C.signal }}>
              A six-month foster with a stipend costs less than most people expect, and custody stays with you. Most owners who pick adoption on the first screen change their mind here. If it genuinely isn't possible, carry on — nobody will judge you for it.
            </p>
            <button onClick={() => setDur("m6")} className="mt-2 text-xs font-bold underline" style={{ color: C.signal }}>
              Look at a 6-month foster instead
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Why are you leaving?"><Sel value={f.reason} onChange={(e) => s("reason", e.target.value)}>
            {REASONS.map((r) => <option key={r}>{r}</option>)}</Sel></Field>
          <Field label="Looking for"><Sel value={f.pref} onChange={(e) => s("pref", e.target.value)}>
            {PREFERENCES.map((p) => <option key={p}>{p}</option>)}</Sel></Field>
          <Field label="Handover date"><Input type="date" value={f.start} onChange={(e) => s("start", e.target.value)} /></Field>
        </div>

        <Field label="Tell them the truth — owners who explain get better applicants">
          <Area value={f.note} onChange={(e) => s("note", e.target.value)}
            placeholder="Six months while I get settled and find a flat that takes cats. I am coming back for him." />
        </Field>

        <p className="rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: C.paper, color: C.muted }}>
          Only {TIER_LABEL.deep.toLowerCase()} caregivers can apply — fostering and adoption both count as unsupervised custody transfer.
          The recommendation engine will rank every eligible caregiver against {pet.name}'s needs, your location, and their availability.
        </p>

        <Btn full disabled={!f.note.trim()} onClick={() => onSave({
          petId: pet.id, duration: dur, reason: f.reason, pref: f.pref, note: f.note, start: new Date(f.start).getTime(),
        })}>Publish listing</Btn>
      </div>
    </Modal>
  );
}
