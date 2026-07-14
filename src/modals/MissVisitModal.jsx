import { useState } from "react";
import { Clock } from "lucide-react";
import { C, display } from "../constants.js";
import { Modal, Btn } from "../primitives.jsx";

export default function MissVisitModal({ pet, onClose, onMiss }) {
  const [reason, setReason] = useState("");
  const opts = ["Stuck in traffic / running late elsewhere", "Personal emergency", "Feeling unwell", "Double-booked myself"];
  return (
    <Modal title="Can't make this visit" onClose={onClose}>
      <div className="mb-3 rounded-xl p-4" style={{ background: C.signalSoft }}>
        <p className="text-sm font-extrabold" style={{ ...display, color: C.signal }}>The owner is notified immediately.</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.signal }}>
          {pet.name} stays in {pet.gender === "Female" ? "her" : "his"} own home and the owner is reachable — this just tells them a visit won't happen, so they can step in or ask someone else. It isn't an emergency broadcast.
        </p>
      </div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>What's happened?</p>
      <div className="space-y-1.5">
        {opts.map((o) => (
          <button key={o} onClick={() => setReason(o)} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold"
            style={{ background: reason === o ? C.signalSoft : C.paper, color: reason === o ? C.signal : C.ink2,
              border: `1px solid ${reason === o ? C.signal : "transparent"}` }}>{o}</button>
        ))}
      </div>
      <div className="mt-4"><Btn full kind="ghost" icon={Clock} disabled={!reason} onClick={() => onMiss(reason)}>Notify the owner</Btn></div>
    </Modal>
  );
}
