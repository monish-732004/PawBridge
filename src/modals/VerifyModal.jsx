import { useState } from "react";
import { Check, Upload } from "lucide-react";
import { C } from "../constants.js";
import { LIGHT_CHECKS, DEEP_CHECKS, INSTITUTION_CHECKS, TIER_LABEL, tierOf } from "../data.js";
import { Modal, Btn, Pill } from "../primitives.jsx";

export default function VerifyModal({ me, onClose, onSubmit }) {
  const isInstitution = me.role === "shelter";
  const stored = isInstitution ? null : tierOf(me);
  const target = isInstitution ? "deep" : stored === "none" ? "light" : "deep";
  const checksAll = isInstitution ? INSTITUTION_CHECKS : target === "light" ? LIGHT_CHECKS : DEEP_CHECKS;
  const keys = Object.keys(checksAll).filter((k) => k !== "noc" || me.renting);
  const held = isInstitution ? (me.institutionVerified || {}) : (me.verified || {});

  const [sel, setSel] = useState(keys);
  const toggle = (k) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : sel.concat(k));

  return (
    <Modal title={isInstitution ? "Submit institution verification" : `Apply for ${TIER_LABEL[target]}`} onClose={onClose}>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        An administrator reads every document. Files are encrypted, visible only to them, and purged 90 days after a decision.
      </p>
      {!isInstitution && (
        <div className="mb-3"><Pill bg={C.paper} fg={C.ink2}>{TIER_LABEL[stored]} → {TIER_LABEL[target]}</Pill></div>
      )}
      <div className="space-y-2">
        {keys.map((k) => {
          const I = checksAll[k].icon;
          const on = sel.includes(k);
          const already = !!held[k];
          return (
            <button key={k} onClick={() => toggle(k)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left"
              style={{ background: on ? C.trustSoft : C.paper, border: `1px solid ${on ? C.trust : "transparent"}` }}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: on ? C.trust : C.line }}>
                {on ? <Check size={13} color="#fff" strokeWidth={3} /> : <I size={13} style={{ color: C.muted }} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: on ? C.trust : C.ink }}>{checksAll[k].label}</p>
                <p className="text-xs" style={{ color: C.muted }}>{already ? "Already on file — resubmitting" : on ? "Attached" : "Tap to attach"}</p>
              </div>
              <Upload size={14} style={{ color: C.muted }} />
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <Btn full icon={Upload} disabled={!sel.length}
          onClick={() => onSubmit({ kind: isInstitution ? "institution" : "individual", tier: target, checks: sel })}>
          Submit {sel.length} document(s)
        </Btn>
      </div>
    </Modal>
  );
}
