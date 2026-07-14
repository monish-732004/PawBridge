import { useState } from "react";
import { Link2 } from "lucide-react";
import { C } from "../constants.js";
import { MOODS } from "../data.js";
import { Modal, Field, Area, Sel, Input, Btn } from "../primitives.jsx";

export default function UpdateModal({ pet, onClose, onPost }) {
  const [f, setF] = useState({ text: "", mood: "settled", photo: "🐾", weight: "" });
  const s = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title={`How is ${pet.name}?`} onClose={onClose}>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        This goes onto the timeline permanently. It cannot be edited or deleted afterwards — not by you, not by the owner, not by us.
      </p>
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>How are they doing?</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(MOODS).map((k) => (
              <button key={k} onClick={() => s("mood", k)} className="rounded-lg py-2 text-xs font-bold"
                style={{ background: f.mood === k ? MOODS[k].color : C.paper, color: f.mood === k ? "#fff" : C.muted }}>
                {MOODS[k].label}
              </button>
            ))}
          </div>
        </div>
        <Field label="What happened">
          <Area value={f.text} onChange={(e) => s("text", e.target.value)}
            placeholder="He's found a spot by the window and claimed it. Runs with me at six. He's stopped watching the door." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Photo / video"><Sel value={f.photo} onChange={(e) => s("photo", e.target.value)}>
            {["🐾", "🐕", "🐈", "🦴", "🛏️", "🌳", "🎾"].map((e) => <option key={e} value={e}>{e}</option>)}</Sel></Field>
          <Field label="Weight (kg)"><Input type="number" step="0.1" value={f.weight} onChange={(e) => s("weight", e.target.value)} placeholder="18.4" /></Field>
        </div>
        <Btn full disabled={!f.text.trim()} icon={Link2} onClick={() => onPost({ ...f, weight: f.weight ? +f.weight : null })}>Add to the timeline</Btn>
      </div>
    </Modal>
  );
}
