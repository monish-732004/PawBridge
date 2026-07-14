import { useState } from "react";
import { ScanLine, CalendarCheck } from "lucide-react";
import { C, display, mono } from "../constants.js";
import { AI_FINDINGS, AI_LABELS } from "../data.js";
import { Modal, Btn } from "../primitives.jsx";

export default function AIModal({ pet, onClose, onLog, onBook }) {
  const [photo, setPhoto] = useState(null);
  const [scanning, setScan] = useState(false);
  const [res, setRes] = useState(null);

  const run = (p) => {
    setPhoto(p); setScan(true); setRes(null);
    setTimeout(() => { setScan(false); setRes(AI_FINDINGS[p]); onLog(p); }, 1400);
  };
  const concern = res && res[0][1] > 0.6 && photo !== "🐕";

  return (
    <Modal title="AI Health Assistant" onClose={onClose}>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        Upload a photo or short video of {pet.name}. This is a <b style={{ color: C.ink }}>screening aid, not a diagnosis</b> — it will never tell you how to treat anything, only whether to see a vet.
      </p>

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Upload</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.keys(AI_FINDINGS).map((p) => (
          <button key={p} onClick={() => run(p)}
            className="flex flex-col items-center gap-1 rounded-lg py-3 text-xs font-semibold"
            style={{ background: photo === p ? C.primarySoft : C.paper, color: photo === p ? C.primary : C.muted,
              border: `1px solid ${photo === p ? C.primary : "transparent"}` }}>
            <span className="text-xl">{p}</span>{AI_LABELS[p]}
          </button>
        ))}
      </div>

      {scanning && (
        <div className="mt-4 flex items-center gap-3 rounded-lg p-4" style={{ background: C.paper }}>
          <ScanLine size={18} className="animate-pulse" style={{ color: C.primary }} />
          <p className="text-sm font-semibold" style={{ color: C.ink2 }}>Analysing…</p>
        </div>
      )}

      {res && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Findings</p>
          <div className="space-y-2.5">
            {res.map((r) => (
              <div key={r[0]}>
                <div className="flex items-center justify-between">
                  <span className="pr-3 text-sm font-semibold" style={{ color: C.ink2 }}>{r[0]}</span>
                  <span className="text-xs font-bold" style={{ ...mono, color: r[1] > .6 ? C.danger : C.muted }}>{Math.round(r[1] * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: C.line }}>
                  <div className="h-full rounded-full" style={{ width: `${r[1] * 100}%`, background: r[1] > .6 ? C.danger : C.line }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl p-4" style={{ background: concern ? C.dangerSoft : C.trustSoft }}>
            <p className="text-sm font-extrabold" style={{ ...display, color: concern ? C.danger : C.trust }}>
              {concern ? `See a vet about ${pet.name}` : "Nothing to flag"}
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: concern ? C.danger : C.trust }}>
              {concern
                ? "This finding has been written to the pet's timeline and the owner notified. Book an appointment — do not treat this yourself."
                : "The screening found nothing that warrants a visit. Keep an eye out and scan again if anything changes."}
            </p>
            {concern && <div className="mt-3"><Btn size="sm" kind="danger" icon={CalendarCheck} onClick={onBook}>Book a vet now</Btn></div>}
          </div>
        </div>
      )}
    </Modal>
  );
}
