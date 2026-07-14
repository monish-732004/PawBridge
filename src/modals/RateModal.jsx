import { useState } from "react";
import { Star } from "lucide-react";
import { C } from "../constants.js";
import { Modal, Area, Btn } from "../primitives.jsx";

export default function RateModal({ other, onClose, onSave }) {
  const [r, setR] = useState(5);
  const [t, setT] = useState("");
  return (
    <Modal title={`Rate ${other.name}`} onClose={onClose}>
      <p className="mb-3 text-sm" style={{ color: C.muted }}>Released at the same time as theirs, so neither of you can see the other's first.</p>
      <div className="mb-3 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onClick={() => setR(i)}>
            <Star size={26} strokeWidth={2} style={{ color: i <= r ? C.signal : C.line }} fill={i <= r ? C.signal : "none"} />
          </button>
        ))}
      </div>
      <Area value={t} onChange={(e) => setT(e.target.value)} placeholder="Updates came without me having to ask. He came back heavier and calmer than he left." />
      <div className="mt-3"><Btn full kind="trust" disabled={!t.trim()} onClick={() => onSave(r, t)}>Submit rating</Btn></div>
    </Modal>
  );
}
