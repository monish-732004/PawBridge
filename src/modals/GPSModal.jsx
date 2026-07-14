import { Eye, Footprints } from "lucide-react";
import { C, mono } from "../constants.js";
import { Modal } from "../primitives.jsx";

export default function GPSModal({ pet, onClose }) {
  const path = [[20, 80], [35, 62], [52, 68], [66, 45], [80, 40], [88, 26]];
  const last = path[path.length - 1];
  return (
    <Modal title={`${pet.name}'s collar`} onClose={onClose}>
      <div className="rounded-xl p-3" style={{ background: C.paper }}>
        <svg viewBox="0 0 100 100" className="h-56 w-full rounded-lg" style={{ background: "#E7EEEA" }}>
          <path d="M0 70 Q30 60 50 72 T100 64" fill="none" stroke="#CBDAD3" strokeWidth="6" />
          <path d="M15 0 L22 100" stroke="#D9E4DF" strokeWidth="4" />
          <path d="M70 0 L64 100" stroke="#D9E4DF" strokeWidth="4" />
          <polyline points={path.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.violet} strokeWidth="1.6" strokeDasharray="3 2" strokeLinecap="round" />
          {path.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={i === path.length - 1 ? 3 : 1.4}
              fill={i === path.length - 1 ? C.violet : "#5B4B8A88"} />
          ))}
          <circle cx={last[0]} cy={last[1]} r="6" fill="none" stroke={C.violet} strokeWidth="0.8" opacity="0.5" />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {[["Current location", "Kadavanthra, 1.2 km from home"], ["Walk today", "3.4 km · 47 min"], ["Activity level", "Normal"]].map(([k, v]) => (
          <div key={k}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{k}</p>
            <p className="text-xs font-semibold" style={{ color: C.ink }}>{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Walk history</p>
        {[["Today", "3.4 km", "47 min"], ["Yesterday", "2.9 km", "38 min"], ["2 days ago", "4.1 km", "55 min"]].map(([d, km, t]) => (
          <div key={d} className="flex items-center justify-between py-1.5 text-xs" style={{ borderTop: `1px solid ${C.line}` }}>
            <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: C.ink2 }}><Footprints size={12} />{d}</span>
            <span style={{ ...mono, color: C.muted }}>{km} · {t}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: C.violetSoft, color: C.violet }}>
        <Eye size={11} className="mr-1 inline" />
        The caregiver sees exactly what you see, and knows you're watching. There is no covert tracking on PawBridge.
      </p>
    </Modal>
  );
}
