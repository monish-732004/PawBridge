import { useState } from "react";
import { Siren } from "lucide-react";
import { C, display } from "../constants.js";
import { Modal, Btn } from "../primitives.jsx";

export default function SOSModal({ pet, onClose, onRaise }) {
  const [reason, setReason] = useState("");
  const opts = ["I've been hospitalised", "I'm being evicted", "Family emergency", "I can no longer afford care", "The pet is not safe here"];
  return (
    <Modal title="Emergency relocation" onClose={onClose}>
      <div className="mb-3 rounded-xl p-4" style={{ background: C.dangerSoft }}>
        <p className="text-sm font-extrabold" style={{ ...display, color: C.danger }}>This is not a small button.</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.danger }}>
          Pressing it notifies every verified caregiver within range, the nearest shelter with capacity, {pet.name}'s owner, and an administrator — immediately, all at once. Use it when you genuinely cannot continue. Nobody will hold it against you.
        </p>
      </div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>What's happened?</p>
      <div className="space-y-1.5">
        {opts.map((o) => (
          <button key={o} onClick={() => setReason(o)} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold"
            style={{ background: reason === o ? C.dangerSoft : C.paper, color: reason === o ? C.danger : C.ink2,
              border: `1px solid ${reason === o ? C.danger : "transparent"}` }}>{o}</button>
        ))}
      </div>
      <div className="mt-4"><Btn full kind="danger" icon={Siren} disabled={!reason} onClick={() => onRaise(reason)}>Broadcast emergency SOS</Btn></div>
    </Modal>
  );
}
