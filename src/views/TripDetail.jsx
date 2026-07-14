import { useState } from "react";
import { ArrowLeft, Check, Clock, Send, MessageSquare, Wallet } from "lucide-react";
import { C, display, body, mono, now, fmt, ago, rupee } from "../constants.js";
import { Card, Btn, Pill, Input, PetHead } from "../primitives.jsx";

export default function TripDetail({ db, me, booking, onBack, setModal, onSend, onReleaseEscrow }) {
  const [draft, setDraft] = useState("");
  const listing = db.tripListings.find((l) => l.id === booking.listingId);
  const pet = db.pets.find((p) => p.id === booking.petId);
  const owner = db.users.find((u) => u.id === booking.ownerId);
  const sitter = db.users.find((u) => u.id === booking.sitterId);
  const other = me.id === booking.ownerId ? sitter : owner;
  const isSitter = me.id === booking.sitterId;
  const visits = db.visits.filter((v) => v.bookingId === booking.id).sort((a, b) => a.scheduledAt - b.scheduledAt);
  const done = visits.filter((v) => v.status === "done").length;
  const missed = visits.filter((v) => v.status === "missed").length;
  const thread = db.messages.filter((m) => m.thread === booking.id).sort((a, b) => a.at - b.at);
  const ended = now() > listing.endDate;

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
              <Pill bg={C.violetSoft} fg={C.violet}>{listing.frequency}</Pill>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Trip", `${fmt(listing.startDate)} → ${fmt(listing.endDate)}`], ["Visits", `${done + missed}/${booking.totalVisits} logged`],
                ["Total cost", rupee(booking.totalAmount)], ["Escrow", booking.escrow.replace("_", " ")]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{k}</p>
                  <p className="text-sm font-semibold" style={{ ...mono, color: C.ink }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {booking.escrow === "held" && (
            <Card className="mb-4 p-5" style={{ background: C.trustSoft, borderColor: C.trust }}>
              <p className="text-base font-extrabold" style={{ ...display, color: C.trust }}>{rupee(booking.totalAmount)} held in escrow</p>
              <p className="mt-1 text-sm" style={{ color: C.trust }}>
                Released to {sitter.name} when the trip ends{missed > 0 ? `, minus ${missed} missed visit(s)` : ""}.
                {ended && " The trip has ended — release is due."}
              </p>
              {!isSitter && <div className="mt-3"><Btn kind="trust" icon={Wallet} onClick={() => onReleaseEscrow(booking.id)}>Release payment now</Btn></div>}
            </Card>
          )}
          {booking.escrow !== "held" && (
            <Card className="mb-4 p-4" style={{ background: C.paper }}>
              <p className="text-sm font-semibold" style={{ color: C.ink2 }}>
                {rupee(booking.releasedAmount)} released{booking.escrow === "partial_released" ? ` (${rupee(booking.totalAmount - booking.releasedAmount)} withheld for missed visits)` : ""}.
              </p>
            </Card>
          )}

          {isSitter && booking.status === "active" && (
            <Card className="mb-4 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Log today's visit</p>
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" icon={Check} onClick={() => setModal({ t: "logVisit", bookingId: booking.id, petId: pet.id, pet })}>Log a completed visit</Btn>
                <Btn size="sm" kind="ghost" icon={Clock} onClick={() => setModal({ t: "missVisit", bookingId: booking.id, petId: pet.id, pet })}>Can't make this visit</Btn>
              </div>
            </Card>
          )}

          <h3 className="mb-3 text-lg font-extrabold" style={{ ...display, color: C.ink }}>Visit log</h3>
          <div className="grid gap-2">
            {visits.map((v) => (
              <Card key={v.id} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ ...mono, color: C.muted }}>Visit {v.index}</span>
                  <Pill icon={v.status === "done" ? Check : Clock}
                    bg={v.status === "done" ? C.trustSoft : v.status === "missed" ? C.dangerSoft : C.paper}
                    fg={v.status === "done" ? C.trust : v.status === "missed" ? C.danger : C.muted}>{v.status}</Pill>
                </div>
                {v.status === "done" && (
                  <p className="mt-1.5 text-sm" style={{ color: C.ink2 }}><span className="mr-1 text-lg">{v.photo}</span>{v.note}</p>
                )}
                {v.status === "missed" && <p className="mt-1.5 text-sm" style={{ color: C.danger }}>{v.missedReason}</p>}
                <p className="mt-1 text-xs" style={{ color: C.muted }}>{fmt(v.scheduledAt)}{v.completedAt ? ` · logged ${ago(v.completedAt)}` : ""}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="flex h-[420px] flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.line}`, background: C.paper }}>
              <MessageSquare size={15} style={{ color: C.muted }} />
              <p className="text-sm font-bold" style={{ color: C.ink }}>{other.avatar} {other.name}</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread.length === 0 && <p className="text-center text-xs" style={{ color: C.muted }}>No messages yet.</p>}
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
                onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { onSend(booking.id, draft.trim()); setDraft(""); } }} />
              <Btn icon={Send} disabled={!draft.trim()} onClick={() => { onSend(booking.id, draft.trim()); setDraft(""); }}>Send</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
