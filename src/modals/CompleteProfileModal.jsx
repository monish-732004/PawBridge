import { useState } from "react";
import { C } from "../constants.js";
import { Modal, Field, Input, Sel, Check2, Btn } from "../primitives.jsx";

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CompleteProfileModal({ me, onClose, onSave }) {
  const isShelter = me.role === "shelter";
  const [f, setF] = useState(isShelter ? {
    registration: me.registration || "", capacity: me.capacity || 10, medicalStaff: me.medicalStaff || "",
  } : {
    houseType: me.houseType || "Apartment", experience: me.experience || 0, petsOwned: me.petsOwned || "None",
    kids: !!me.kids, otherPets: !!me.otherPets, workingHours: me.workingHours || 4, capacity: me.capacity || 1,
    species: me.species && me.species.length ? me.species : ["dog"],
    availability: MONTHS.reduce((a, m) => ({ ...a, [m]: (me.availability && me.availability[m]) ?? true }), {}),
  });
  const s = (k, v) => setF({ ...f, [k]: v });
  const toggleSpecies = (sp) => setF({ ...f, species: f.species.includes(sp) ? f.species.filter((x) => x !== sp) : f.species.concat(sp) });

  return (
    <Modal title="Complete your profile" onClose={onClose} wide>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        {isShelter ? "This is what appears on intake requests and the recommendation engine."
          : "This is what the recommendation engine matches you against — the more accurate, the better your matches."}
      </p>
      <div className="space-y-3">
        {isShelter ? (
          <>
            <Field label="Registration number"><Input value={f.registration} onChange={(e) => s("registration", e.target.value)} placeholder="KL/AW/2016/442" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacity"><Input type="number" value={f.capacity} onChange={(e) => s("capacity", +e.target.value)} /></Field>
              <Field label="Medical staff"><Input value={f.medicalStaff} onChange={(e) => s("medicalStaff", e.target.value)} placeholder="2 full-time vets" /></Field>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="House type"><Sel value={f.houseType} onChange={(e) => s("houseType", e.target.value)}>
                <option>Apartment</option><option>Independent House</option><option>Farm</option></Sel></Field>
              <Field label="Experience (years)"><Input type="number" value={f.experience} onChange={(e) => s("experience", +e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pets you own"><Input value={f.petsOwned} onChange={(e) => s("petsOwned", e.target.value)} placeholder="None" /></Field>
              <Field label="Capacity (animals you can take)"><Input type="number" value={f.capacity} onChange={(e) => s("capacity", +e.target.value)} /></Field>
            </div>
            <Field label="Alone per day (hours)"><Input type="number" value={f.workingHours} onChange={(e) => s("workingHours", +e.target.value)} /></Field>
            <div className="flex flex-wrap gap-4">
              <Check2 label="Kids at home" checked={f.kids} onChange={(v) => s("kids", v)} />
              <Check2 label="Other pets at home" checked={f.otherPets} onChange={(v) => s("otherPets", v)} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Species you'll take</p>
              <div className="flex gap-4">
                <Check2 label="Dogs" checked={f.species.includes("dog")} onChange={() => toggleSpecies("dog")} />
                <Check2 label="Cats" checked={f.species.includes("cat")} onChange={() => toggleSpecies("cat")} />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Availability</p>
              <div className="flex flex-wrap gap-2">
                {MONTHS.map((m) => (
                  <button key={m} type="button" onClick={() => s("availability", { ...f.availability, [m]: !f.availability[m] })}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                    style={{ background: f.availability[m] ? C.trustSoft : C.paper, color: f.availability[m] ? C.trust : C.muted }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <Btn full onClick={() => onSave(f)}>Save profile</Btn>
      </div>
    </Modal>
  );
}
