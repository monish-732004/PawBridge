import { Star, X, AlertTriangle, BadgeCheck, ShieldCheck, Check, Stethoscope } from "lucide-react";
import { C, display, body, mono, avg } from "./constants.js";
import { TIER_LABEL, DURATIONS } from "./data.js";
import { effectiveTier } from "./logic.js";

export const Pill = ({ children, bg, fg, icon: I }) => (
  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
    style={{ background: bg, color: fg, ...body }}>{I && <I size={12} strokeWidth={2.5} />}{children}</span>
);

export const Btn = ({ children, onClick, kind = "primary", size = "md", disabled, icon: I, full }) => {
  const s = {
    primary: { background: C.primary, color: "#fff", border: `1px solid ${C.primary}` },
    trust:   { background: C.trust,   color: "#fff", border: `1px solid ${C.trust}`   },
    ghost:   { background: "transparent", color: C.ink2, border: `1px solid ${C.line}` },
    danger:  { background: C.danger,  color: "#fff", border: `1px solid ${C.danger}`  },
  }[kind];
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"} ${full ? "w-full" : ""}`}
      style={{ ...s, ...body }}>{I && <I size={size === "sm" ? 13 : 15} strokeWidth={2.5} />}{children}</button>
  );
};

export const Card = ({ children, className = "", style = {}, onClick }) => (
  <div onClick={onClick} className={`rounded-xl ${className}`}
    style={{ background: C.surface, border: `1px solid ${C.line}`, ...style }}>{children}</div>
);

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted, ...body }}>{label}</span>
    {children}
  </label>
);

const iCls = "w-full rounded-lg px-3 py-2 text-sm outline-none";
const iSty = { background: C.paper, border: `1px solid ${C.line}`, color: C.ink };
export const Input  = (p) => <input    {...p} className={iCls} style={iSty} />;
export const Area   = (p) => <textarea {...p} className={iCls} style={{ ...iSty, minHeight: 76, resize: "vertical" }} />;
export const Sel    = ({ children, ...p }) => <select {...p} className={iCls} style={iSty}>{children}</select>;

export const Check2 = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.ink2, ...body }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}
  </label>
);

export const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
    style={{ background: "rgba(15,30,36,.55)" }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()}
      className={`w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl`}
      style={{ background: C.surface }}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <h3 className="pr-4 text-lg font-extrabold" style={{ ...display, color: C.ink }}>{title}</h3>
        <button onClick={onClose} style={{ color: C.muted }}><X size={18} /></button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  </div>
);

export const Empty = ({ icon: I, title, sub, action }) => (
  <div className="flex flex-col items-center rounded-xl px-6 py-14 text-center"
    style={{ border: `1px dashed ${C.line}`, background: C.surface }}>
    <I size={26} style={{ color: C.muted }} />
    <p className="mt-3 text-base font-bold" style={{ ...display, color: C.ink }}>{title}</p>
    <p className="mt-1 max-w-sm text-sm" style={{ ...body, color: C.muted }}>{sub}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Stars = ({ n, size = 13 }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} strokeWidth={2} style={{ color: i <= Math.round(n) ? C.signal : C.line }}
        fill={i <= Math.round(n) ? C.signal : "none"} />
    ))}
  </span>
);

export const VBadge = ({ db, u }) => {
  const tier = effectiveTier(db, u);
  return <Pill icon={tier === "deep" ? ShieldCheck : tier === "light" ? BadgeCheck : AlertTriangle}
    bg={tier === "deep" ? C.trustSoft : tier === "light" ? C.signalSoft : C.dangerSoft}
    fg={tier === "deep" ? C.trust     : tier === "light" ? C.signal     : C.danger}>{TIER_LABEL[tier]}</Pill>;
};

export const Trust = ({ score }) => (
  <div className="flex items-center gap-1.5">
    <div className="h-1.5 w-14 overflow-hidden rounded-full" style={{ background: C.line }}>
      <div className="h-full rounded-full"
        style={{ width: `${Math.max(0, score)}%`, background: score >= 70 ? C.trust : score >= 45 ? C.signal : C.danger }} />
    </div>
    <span className="text-xs font-semibold" style={{ ...mono, color: C.ink2 }}>{score}</span>
  </div>
);

export const Ring = ({ score, size = 54 }) => {
  const r = (size - 6) / 2, cc = 2 * Math.PI * r;
  const col = score >= 75 ? C.trust : score >= 50 ? C.signal : C.danger;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="4"
          strokeDasharray={cc} strokeDashoffset={cc * (1 - score / 100)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold leading-none" style={{ ...display, color: col }}>{score}%</span>
      </div>
    </div>
  );
};

export const PetHead = ({ pet }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: C.paper }}>{pet.emoji}</div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-extrabold" style={{ ...display, color: C.ink }}>{pet.name}</h4>
        {pet.condition && <Pill icon={Stethoscope} bg={C.signalSoft} fg={C.signal}>Special needs</Pill>}
      </div>
      <p className="text-xs" style={{ ...body, color: C.muted }}>{pet.breed} · {pet.age}y · {pet.gender} · {pet.size}</p>
      <p className="mt-1 text-xs leading-relaxed" style={{ ...body, color: C.ink2 }}>{pet.temperament}</p>
    </div>
  </div>
);

export const DurTag = ({ d }) => {
  const perm = DURATIONS[d].permanent;
  return <Pill bg={perm ? C.signalSoft : C.trustSoft} fg={perm ? C.signal : C.trust}>
    {perm ? "Permanent · Adoption" : `Temporary · ${DURATIONS[d].label}`}</Pill>;
};

export const Section = ({ title, sub, action, children }) => (
  <section>
    <Card className="mb-4 flex flex-wrap items-end justify-between gap-3 p-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight" style={{ ...display, color: C.ink }}>{title}</h2>
        {sub && <p className="mt-0.5 max-w-2xl text-sm" style={{ ...body, color: C.muted }}>{sub}</p>}
      </div>
      {action}
    </Card>
    {children}
  </section>
);

export const Stat = ({ k, v, col, icon: I }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <p className="text-3xl font-extrabold leading-none" style={{ ...display, color: col }}>{v}</p>
      {I && <I size={16} style={{ color: C.muted }} />}
    </div>
    <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide" style={{ ...body, color: C.muted }}>{k}</p>
  </Card>
);
