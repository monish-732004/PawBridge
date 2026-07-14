import { useState } from "react";
import { Upload } from "lucide-react";
import { C } from "../constants.js";
import { Modal, Field, Input, Sel, Area, Check2, Btn } from "../primitives.jsx";

export default function PetModal({ onClose, onSave }) {
  const [f, setF] = useState({
    name: "", emoji: "🐕", species: "dog", breed: "", age: 2, gender: "Female", size: "medium",
    vaccinated: true, sterilised: true, condition: "", meds: "", history: "", temperament: "",
    food: "", activity: "Moderate — two walks", routine: "", kids: true, dogs: true, cats: true, collar: false,
  });
  const s = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title="Register a pet" onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Name"><Input value={f.name} onChange={(e) => s("name", e.target.value)} placeholder="Idli" /></Field>
          <Field label="Species"><Sel value={f.species} onChange={(e) => s("species", e.target.value)}>
            <option value="dog">Dog</option><option value="cat">Cat</option></Sel></Field>
          <Field label="Photo"><Sel value={f.emoji} onChange={(e) => s("emoji", e.target.value)}>
            {["🐕", "🐶", "🐕‍🦺", "🐩", "🐈", "🐱", "🐈‍⬛"].map((e) => <option key={e} value={e}>{e}</option>)}</Sel></Field>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Breed"><Input value={f.breed} onChange={(e) => s("breed", e.target.value)} placeholder="Indie" /></Field>
          <Field label="Age"><Input type="number" value={f.age} onChange={(e) => s("age", +e.target.value)} /></Field>
          <Field label="Gender"><Sel value={f.gender} onChange={(e) => s("gender", e.target.value)}><option>Female</option><option>Male</option></Sel></Field>
          <Field label="Size"><Sel value={f.size} onChange={(e) => s("size", e.target.value)}>
            <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></Sel></Field>
        </div>
        <Field label="Temperament"><Input value={f.temperament} onChange={(e) => s("temperament", e.target.value)} placeholder="Calm, wary of loud noises" /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Food habits"><Input value={f.food} onChange={(e) => s("food", e.target.value)} placeholder="Home-cooked rice and chicken, twice a day" /></Field>
          <Field label="Activity level"><Sel value={f.activity} onChange={(e) => s("activity", e.target.value)}>
            <option>Low</option><option>Moderate — two walks</option><option>High — needs a proper run daily</option></Sel></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Ongoing condition (blank if none)"><Input value={f.condition} onChange={(e) => s("condition", e.target.value)} placeholder="Diabetes" /></Field>
          <Field label="Medication & dosing"><Input value={f.meds} onChange={(e) => s("meds", e.target.value)} placeholder="Insulin, 2 units, twice daily" /></Field>
        </div>
        <Field label="Medical history"><Input value={f.history} onChange={(e) => s("history", e.target.value)} placeholder="Spayed 2023. No prior illness." /></Field>
        <Field label="Routine — the things only you know">
          <Area value={f.routine} onChange={(e) => s("routine", e.target.value)} placeholder="Sleeps at the foot of the bed. Will not eat without her blue bowl." />
        </Field>

        <div className="flex flex-wrap gap-4 pt-1">
          <Check2 label="Friendly with kids" checked={f.kids} onChange={(v) => s("kids", v)} />
          <Check2 label="Friendly with dogs" checked={f.dogs} onChange={(v) => s("dogs", v)} />
          <Check2 label="Friendly with cats" checked={f.cats} onChange={(v) => s("cats", v)} />
          <Check2 label="Vaccinated" checked={f.vaccinated} onChange={(v) => s("vaccinated", v)} />
          <Check2 label="Smart collar (GPS)" checked={f.collar} onChange={(v) => s("collar", v)} />
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {["Photos", "Videos", "Vaccination certificate", "Medical reports"].map((x) => (
            <div key={x} className="flex h-16 flex-col items-center justify-center rounded-lg px-2 text-center text-[10px] font-semibold"
              style={{ background: C.paper, color: C.muted }}>
              <Upload size={13} className="mb-1" />{x}
            </div>
          ))}
        </div>

        {f.condition && <p className="rounded-lg px-3 py-2 text-xs" style={{ background: C.signalSoft, color: C.signal }}>
          Flagged as special needs. Only police-verified caregivers and shelters will be able to apply.
        </p>}
        <Btn full disabled={!f.name || !f.breed} onClick={() => onSave(f)}>Register {f.name || "pet"}</Btn>
      </div>
    </Modal>
  );
}
