import { useState } from "react";
import { Send } from "lucide-react";
import { C } from "../constants.js";
import { DURATIONS } from "../data.js";
import { Modal, Area, Btn } from "../primitives.jsx";

export default function ApplyModal({ pet, l, onClose, onSend }) {
  const [note, setNote] = useState("");
  return (
    <Modal title={`Offer to care for ${pet.name}`} onClose={onClose}>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        The owner sees your note next to every other applicant's, alongside your verification, trust score, and ratings. Say something true rather than something impressive.
      </p>
      {pet.condition && <p className="mb-3 rounded-lg px-3 py-2 text-xs" style={{ background: C.signalSoft, color: C.signal }}>
        <b>{pet.name} has {pet.condition.toLowerCase()}.</b> {pet.meds} — tell them exactly how you'll handle it.
      </p>}
      <p className="mb-3 rounded-lg px-3 py-2 text-xs" style={{ background: C.paper, color: C.muted }}>
        {DURATIONS[l.duration].permanent
          ? "This is a permanent adoption. Custody would transfer to you, subject to admin approval."
          : `This is a ${DURATIONS[l.duration].label} foster. Custody stays with the owner.`}
      </p>
      <Area value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="I've managed a diabetic cat before — twice-daily insulin is routine for me, and I work from home." />
      <div className="mt-3"><Btn full icon={Send} disabled={!note.trim()} onClick={() => onSend(note)}>Send request</Btn></div>
    </Modal>
  );
}
