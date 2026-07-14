import { C, mono } from "../constants.js";
import { Modal } from "../primitives.jsx";

export default function WhyModal({ m, cg, pet, onClose }) {
  return (
    <Modal title={`Why ${cg.name} scores ${m.score}% for ${pet.name}`} onClose={onClose}>
      <p className="mb-4 text-sm leading-relaxed" style={{ color: C.muted }}>
        Match scores are shown to both sides and always explained. A low score isn't a rejection — it's information.
      </p>
      <div className="space-y-3">
        {m.parts.map((p) => (
          <div key={p.k}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: C.ink }}>{p.k}</span>
              <span className="text-xs font-bold" style={{ ...mono, color: p.got === p.max ? C.trust : p.got === 0 ? C.danger : C.signal }}>{p.got} / {p.max}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: C.line }}>
              <div className="h-full rounded-full" style={{ width: `${(p.got / p.max) * 100}%`, background: p.got === p.max ? C.trust : p.got === 0 ? C.danger : C.signal }} />
            </div>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>{p.why}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
