import { useState } from "react";
import { Check } from "lucide-react";
import { C } from "../constants.js";
import { Modal, Field, Sel, Area, Btn } from "../primitives.jsx";

export default function LogVisitModal({ pet, onClose, onLog }) {
  const [f, setF] = useState({ photo: "🐾", note: "" });
  const s = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title={`Log this visit — ${pet.name}`} onClose={onClose}>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        Timestamped automatically and added to {pet.name}'s permanent record.
      </p>
      <div className="space-y-3">
        <Field label="Photo"><Sel value={f.photo} onChange={(e) => s("photo", e.target.value)}>
          {["🐾", "🐕", "🐈", "🦴", "🥣", "🎾"].map((e) => <option key={e} value={e}>{e}</option>)}</Sel></Field>
        <Field label="What happened">
          <Area value={f.note} onChange={(e) => s("note", e.target.value)}
            placeholder="Fed and walked, all calm. Gave the 8pm dose on schedule." />
        </Field>
        <Btn full disabled={!f.note.trim()} icon={Check} onClick={() => onLog(f)}>Mark visit complete</Btn>
      </div>
    </Modal>
  );
}
