import { Link2, AlertTriangle, Check, Stethoscope, Scale, Heart } from "lucide-react";
import { C, display, body, mono, now, DAY, fmt, ago } from "./constants.js";
import { MOODS, CARE_ACTS } from "./data.js";
import { overdue } from "./logic.js";
import { Card, Pill } from "./primitives.jsx";

export default function PetTimeline({ db, ag, me, onReact }) {
  const items = db.timeline.filter((x) => x.agId === ag.id).sort((a, b) => a.at - b.at);
  const od  = overdue(db, ag);
  const pet = db.pets.find((p) => p.id === ag.petId);
  const cg  = db.users.find((u) => u.id === ag.caregiverId);
  const ups = items.filter((i) => i.kind === "update");
  const last = ups.length ? Math.max.apply(null, ups.map((u) => u.at)) : ag.start;

  return (
    <div className="relative pl-8">
      <div className="absolute bottom-2 left-[11px] top-2 w-px" style={{ background: C.line }} />
      {items.map((it) => {
        const CareIcon = it.kind === "care" ? CARE_ACTS[it.act]?.icon : null;
        return (
          <div key={it.id} className="relative mb-3">
            <div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: it.kind === "update" ? C.surface : it.kind === "medical" ? C.trustSoft : C.paper,
                border: `2px solid ${it.kind === "update" ? MOODS[it.mood]?.color || C.trust : it.kind === "medical" ? C.trust : C.line}`,
              }}>
              {it.kind === "update"   ? <Link2       size={11} strokeWidth={3} style={{ color: MOODS[it.mood]?.color || C.trust }} />
                : it.kind === "medical" ? <Stethoscope size={11} strokeWidth={3} style={{ color: C.trust }} />
                  : CareIcon              ? <CareIcon    size={11} strokeWidth={3} style={{ color: C.muted }} />
                    :                       <Check        size={11} strokeWidth={3} style={{ color: C.muted }} />}
            </div>
            {it.kind === "event" && (
              <p className="pt-1.5 text-xs" style={{ ...body, color: C.muted }}>
                <span className="font-semibold">{it.text}</span> · {fmt(it.at)}
              </p>
            )}
            {it.kind === "care" && (
              <p className="pt-1.5 text-xs" style={{ ...body, color: C.muted }}>
                <span className="font-semibold" style={{ color: C.ink2 }}>{CARE_ACTS[it.act]?.label}</span> by {cg?.name} · {ago(it.at)}
              </p>
            )}
            {it.kind === "medical" && (
              <Card className="p-3" style={{ borderColor: C.trust + "44" }}>
                <div className="flex items-center gap-2">
                  <Pill icon={Stethoscope} bg={C.trustSoft} fg={C.trust}>Medical record</Pill>
                  <span className="text-xs" style={{ ...mono, color: C.muted }}>{fmt(it.at)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ ...body, color: C.ink2 }}>{it.text}</p>
                {it.vet && <p className="mt-1 text-xs" style={{ ...mono, color: C.muted }}>Attending: {it.vet}</p>}
              </Card>
            )}
            {it.kind === "update" && (
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{it.photo}</span>
                    <div>
                      <p className="text-xs font-bold" style={{ ...body, color: C.ink }}>{cg?.name}</p>
                      <p className="text-xs" style={{ ...body, color: C.muted }}>{ago(it.at)} · {fmt(it.at)}</p>
                    </div>
                  </div>
                  <Pill bg={(MOODS[it.mood]?.color || C.trust) + "1A"} fg={MOODS[it.mood]?.color || C.trust}>{MOODS[it.mood]?.label}</Pill>
                </div>
                <p className="px-4 py-3 text-sm leading-relaxed" style={{ ...body, color: C.ink2 }}>{it.text}</p>
                <div className="flex flex-wrap items-center gap-3 px-4 pb-3 text-xs" style={{ ...mono, color: C.muted }}>
                  {it.weight ? <span className="inline-flex items-center gap-1"><Scale size={12} />{it.weight} kg</span> : null}
                  {it.reactions && it.reactions.length ? <span className="inline-flex items-center gap-1" style={{ color: C.danger }}>
                    <Heart size={12} fill={C.danger} />{it.reactions.length}</span> : null}
                  {me.id === ag.ownerId && !(it.reactions || []).includes(me.id) && (
                    <button onClick={() => onReact(it.id)} className="inline-flex items-center gap-1 font-semibold" style={{ color: C.muted }}>
                      <Heart size={12} />Acknowledge
                    </button>
                  )}
                </div>
              </Card>
            )}
          </div>
        );
      })}
      {od > 0 && (
        <div className="relative mb-3">
          <div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: C.dangerSoft, border: `2px dashed ${C.danger}` }}>
            <AlertTriangle size={11} strokeWidth={3} style={{ color: C.danger }} />
          </div>
          <div className="rounded-xl px-4 py-3" style={{ background: C.dangerSoft, border: `1px dashed ${C.danger}55` }}>
            <p className="text-sm font-bold" style={{ ...display, color: C.danger }}>The timeline is broken</p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ ...body, color: C.danger }}>
              An update on {pet?.name} was due {od} {od === 1 ? "day" : "days"} ago. Cadence agreed: every {ag.cadence} days.
            </p>
          </div>
        </div>
      )}
      {ag.status === "active" && od === 0 && (
        <div className="relative">
          <div className="absolute -left-8 top-1 h-6 w-6 rounded-full border-2 border-dashed" style={{ borderColor: C.line }} />
          <p className="pt-1.5 text-xs" style={{ ...body, color: C.muted }}>
            Next update due in {ag.cadence - Math.floor((now() - last) / DAY)} days.
          </p>
        </div>
      )}
    </div>
  );
}
