import { useState } from "react";
import {
  ArrowLeft, PenLine, Check, Star, Siren, Navigation, Undo2, MessageSquare, Send,
  Plus, ScanLine, CalendarCheck, Wallet, Clock,
} from "lucide-react";
import { C, display, body, mono, now, DAY, fmt, rupee, ago } from "../constants.js";
import { DURATIONS, CARE_ACTS, EXPENSE_CATS } from "../data.js";
import { Card, Btn, Pill, PetHead, DurTag, Input } from "../primitives.jsx";
import PetTimeline from "../PetTimeline.jsx";

export default function CareDetail({ db, me, ag, onBack, onReact, setModal, onCountersign, onReqReturn, onConfirmReturn, onSend, onLogCare, onReimburse }) {
  const [draft, setDraft] = useState("");
  const pet = db.pets.find((p) => p.id === ag.petId);
  const owner = db.users.find((u) => u.id === ag.ownerId);
  const cg = db.users.find((u) => u.id === ag.caregiverId);
  const other = me.id === ag.ownerId ? cg : owner;
  const thread = db.messages.filter((m) => m.thread === ag.id).sort((a, b) => a.at - b.at);
  const isCg = me.id === ag.caregiverId;
  const perm = DURATIONS[ag.duration].permanent;
  const exs = db.expenses.filter((e) => e.agId === ag.id);
  const apps = db.appointments.filter((a) => a.petId === ag.petId);
  const sos = db.sos.find((s) => s.agId === ag.id && s.status === "open");
  const today = db.timeline.filter((x) => x.agId === ag.id && x.kind === "care" && now() - x.at < DAY);

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.muted, ...body }}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <Card className="mb-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PetHead pet={pet} />
              <DurTag d={ag.duration} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Started", fmt(ag.start)], ["Ends", ag.end ? fmt(ag.end) : "Permanent"],
                ["Update cadence", `Every ${ag.cadence} days`], ["Stipend", ag.stipend ? `${rupee(ag.stipend)}/mo` : "None"]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{k}</p>
                  <p className="text-sm font-semibold" style={{ ...mono, color: C.ink }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 rounded-lg px-3 py-2.5 text-xs leading-relaxed" style={{ background: C.paper, color: C.muted }}>
              <p><b style={{ color: C.ink2 }}>Ownership rights.</b> {ag.ownership}</p>
              <p><b style={{ color: C.ink2 }}>Medical expenses.</b> Up to {rupee(ag.medicalCap)} met by the caregiver; above that, {owner.name} must be consulted before treatment.</p>
              <p><b style={{ color: C.ink2 }}>Return conditions.</b> {ag.returnConditions}</p>
            </div>
          </Card>

          {ag.status === "awaiting_admin" && (
            <Card className="mb-4 p-5" style={{ background: C.violetSoft, borderColor: C.violet }}>
              <p className="text-base font-extrabold" style={{ ...display, color: C.violet }}>Awaiting admin approval</p>
              <p className="mt-1 text-sm" style={{ color: C.violet }}>
                No permanent transfer of custody completes without a human signing off on it. This usually takes under 24 hours.
              </p>
            </Card>
          )}

          {ag.status === "awaiting_signature" && (
            <Card className="mb-4 p-5" style={{ background: C.signalSoft, borderColor: C.signal }}>
              <p className="text-base font-extrabold" style={{ ...display, color: C.signal }}>
                {isCg ? "This agreement needs your signature" : `Waiting for ${cg.name} to sign`}
              </p>
              <p className="mt-1 text-sm" style={{ color: C.signal }}>
                The timeline does not begin — and {pet.name} is not handed over — until both names are on it.
              </p>
              {isCg && <div className="mt-3"><Btn kind="trust" icon={PenLine} onClick={() => onCountersign(ag.id)}>Sign as {me.name}</Btn></div>}
            </Card>
          )}

          {sos && (
            <Card className="mb-4 p-5" style={{ background: C.dangerSoft, borderColor: C.danger }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold" style={{ ...display, color: C.danger }}>Emergency relocation in progress</p>
                  <p className="mt-1 text-sm" style={{ color: C.danger }}>
                    {sos.responders.length} verified caregiver(s) have offered to take {pet.name}. The nearest shelter with capacity was notified in parallel.
                  </p>
                </div>
                {sos.responders.length > 0 && (me.id === sos.by || me.id === ag.ownerId) &&
                  <Btn size="sm" kind="danger" onClick={() => setModal({ t: "sosResolve", s: sos })}>Choose a responder</Btn>}
              </div>
            </Card>
          )}

          {ag.returnRequested && ag.status === "active" && (
            <Card className="mb-4 p-5" style={{ background: C.primarySoft, borderColor: C.primary }}>
              <p className="text-base font-extrabold" style={{ ...display, color: C.primary }}>Return requested</p>
              <p className="mt-1 text-sm" style={{ color: C.primary }}>
                {owner.name} asked for {pet.name} back on {fmt(ag.returnRequested)}. The notice period is 14 days.
              </p>
              {isCg && <div className="mt-3"><Btn kind="trust" icon={Check} onClick={() => onConfirmReturn(ag.id)}>Confirm handover completed</Btn></div>}
            </Card>
          )}

          {ag.status === "completed" && !ag.reviews[me.id] && (
            <Card className="mb-4 p-5" style={{ background: C.trustSoft, borderColor: C.trust }}>
              <p className="text-base font-extrabold" style={{ ...display, color: C.trust }}>Placement complete</p>
              <p className="mt-1 text-sm" style={{ color: C.trust }}>Ratings are released to both sides at the same time, so neither of you can retaliate.</p>
              <div className="mt-3"><Btn kind="trust" icon={Star} onClick={() => setModal({ t: "rate", agId: ag.id, other })}>Rate {other.name}</Btn></div>
            </Card>
          )}

          {isCg && ag.status === "active" && (
            <Card className="mb-4 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Today's care log</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.keys(CARE_ACTS).map((k) => {
                  const v = CARE_ACTS[k];
                  const done = today.some((x) => x.act === k);
                  const I = v.icon;
                  return (
                    <button key={k} onClick={() => onLogCare(ag.id, pet.id, k)} disabled={done}
                      className="flex flex-col items-center gap-1.5 rounded-lg py-3 text-xs font-bold disabled:opacity-100"
                      style={{ background: done ? C.trustSoft : C.paper, color: done ? C.trust : C.ink2, border: `1px solid ${done ? C.trust : "transparent"}` }}>
                      {done ? <Check size={16} strokeWidth={3} /> : <I size={16} />}
                      {done ? `${v.label} ✓` : v.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn size="sm" icon={Plus} onClick={() => setModal({ t: "update", agId: ag.id, petId: pet.id })}>Post an update</Btn>
                <Btn size="sm" kind="ghost" icon={ScanLine} onClick={() => setModal({ t: "ai", petId: pet.id, agId: ag.id, pet })}>AI health check</Btn>
                <Btn size="sm" kind="ghost" icon={CalendarCheck} onClick={() => setModal({ t: "book", petId: pet.id, agId: ag.id, pet })}>Book a vet</Btn>
                <Btn size="sm" kind="ghost" icon={Wallet} onClick={() => setModal({ t: "expense", agId: ag.id, petId: pet.id, pet, cap: ag.medicalCap })}>Log an expense</Btn>
                <Btn size="sm" kind="danger" icon={Siren} onClick={() => setModal({ t: "sos", agId: ag.id, pet })}>Emergency SOS</Btn>
              </div>
            </Card>
          )}

          {!isCg && ag.status === "active" && (
            <div className="mb-4 flex flex-wrap gap-2">
              {ag.gps && pet.collar && <Btn size="sm" kind="ghost" icon={Navigation} onClick={() => setModal({ t: "gps", pet })}>GPS tracking</Btn>}
              {!perm && !ag.returnRequested && <Btn size="sm" kind="ghost" icon={Undo2} onClick={() => onReqReturn(ag.id)}>Request {pet.name} back</Btn>}
            </div>
          )}

          {(exs.length > 0 || apps.length > 0) && (
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Expenses</p>
                <p className="text-2xl font-extrabold" style={{ ...display, color: C.ink }}>{rupee(exs.reduce((a, b) => a + b.amount, 0))}</p>
                <p className="text-xs" style={{ color: C.danger }}>{rupee(exs.filter((e) => !e.reimbursed).reduce((a, b) => a + b.amount, 0))} unreimbursed</p>
                <div className="mt-3 space-y-1.5">
                  {exs.slice(-3).reverse().map((e) => {
                    const I = EXPENSE_CATS[e.cat];
                    return (
                      <div key={e.id} className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 truncate pr-2" style={{ color: C.ink2 }}><I size={12} />{e.note}</span>
                        <span className="inline-flex shrink-0 items-center gap-2" style={{ ...mono }}>
                          {rupee(e.amount)}
                          {e.reimbursed ? <Check size={12} style={{ color: C.trust }} />
                            : !isCg ? <button onClick={() => onReimburse(e.id)} className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: C.primary, color: "#fff" }}>Pay</button>
                              : <Clock size={12} style={{ color: C.signal }} />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card className="p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Vet appointments</p>
                <div className="space-y-2">
                  {apps.length === 0 && <p className="text-xs" style={{ color: C.muted }}>None booked.</p>}
                  {apps.map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold" style={{ color: C.ink }}>{a.type}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{a.clinic} · {fmt(a.at)}</p>
                      </div>
                      <Pill icon={a.status === "completed" ? Check : Clock}
                        bg={a.status === "completed" ? C.trustSoft : C.signalSoft}
                        fg={a.status === "completed" ? C.trust : C.signal}>{a.status}</Pill>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          <h3 className="mb-4 text-xl font-extrabold" style={{ ...display, color: C.ink }}>{pet.name}'s timeline</h3>
          <PetTimeline db={db} ag={ag} me={me} onReact={onReact} />
        </div>

        <div>
          <Card className="flex h-[520px] flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.line}`, background: C.paper }}>
              <MessageSquare size={15} style={{ color: C.muted }} />
              <p className="text-sm font-bold" style={{ color: C.ink }}>{other.avatar} {other.name}</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread.length === 0 && <p className="text-center text-xs" style={{ color: C.muted }}>No messages yet. Ask how {pet.name} is sleeping.</p>}
              {thread.map((m) => {
                const mine = m.from === me.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                      style={{ background: mine ? C.primary : C.paper, color: mine ? "#fff" : C.ink2 }}>
                      {m.text}
                      <div className="mt-0.5 text-[10px]" style={{ opacity: .6 }}>{ago(m.at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 p-3" style={{ borderTop: `1px solid ${C.line}` }}>
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message"
                onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { onSend(ag.id, draft.trim()); setDraft(""); } }} />
              <Btn icon={Send} disabled={!draft.trim()} onClick={() => { onSend(ag.id, draft.trim()); setDraft(""); }}>Send</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
