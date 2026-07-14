import { Search, Heart, Sparkles, Link2, ShieldCheck, Building2, MessagesSquare, Ban, CalendarCheck, BarChart3, Flame, ChevronRight, ArrowRight } from "lucide-react";
import { C, display, body, mono, fmt, ago } from "../constants.js";
import { MOODS } from "../data.js";
import { overdue, effectiveTier } from "../logic.js";
import { Card, Btn } from "../primitives.jsx";

export default function HomeView({ db, me, setTab, setFocus, myAgs, inbound, activeSOS, onRespondSOS }) {
  const R = me.role;
  const active = myAgs.filter((a) => a.status === "active");
  const doors = {
    owner:   [["Find a foster home", Search, "pets"], ["Put a pet up for adoption", Heart, "pets"], ["See my matches", Sparkles, "matches"], ["Pet timeline", Link2, "timeline"]],
    foster:  [["Find a pet to foster", Search, "browse"], ["Complete my verification", ShieldCheck, "profile"], ["Pets in my care", Link2, "care"], ["Community", MessagesSquare, "community"]],
    shelter: [["Intake requests", Search, "browse"], ["Update capacity", Building2, "capacity"], ["Pets in our care", Link2, "care"], ["Community", MessagesSquare, "community"]],
    admin:   [["Verification queue", ShieldCheck, "verify"], ["Fraud & flags", Ban, "fraud"], ["Adoption approvals", CalendarCheck, "adopt"], ["Analytics", BarChart3, "stats"]],
  }[R];
  const liveUpdates = db.timeline.filter((x) => x.kind === "update" && myAgs.some((a) => a.id === x.agId)).sort((a, b) => b.at - a.at).slice(0, 6);
  const pendingReq = inbound.filter((r) => r.status === "pending").length;
  return (
    <div>
      <Card className="mb-5 overflow-hidden">
        <div className="px-6 py-7" style={{ background: `linear-gradient(135deg, ${C.trust} 0%, ${C.ink} 100%)` }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ ...mono, color: "#8FD3BE" }}>Welcome back, {me.name.split(" ")[0]}</p>
          <h1 className="mt-1.5 max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" style={{ ...display, color: "#fff" }}>
            Nobody should have to choose between a job and their dog.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "#B9D4CA" }}>
            When life moves, PawBridge finds a verified home, writes down what was agreed, and keeps the photos coming.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {doors.map(([label, I, t]) => (
              <button key={label} onClick={() => setTab(t)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold"
                style={{ background: "#ffffff1a", color: "#fff", border: "1px solid #ffffff2e", ...body }}>
                <I size={14} strokeWidth={2.5} />{label}<ArrowRight size={13} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[["Pets placed", db.agreements.length], ["Active fosters", db.users.filter((u) => u.role === "foster" && effectiveTier(db, u) === "deep" && !u.banned).length],
            ["Adoptions", db.agreements.filter((a) => a.duration === "adopt").length], ["Emergency cases", db.sos.length]].map(([k, v]) => (
            <div key={k} className="px-4 py-3 text-center" style={{ borderRight: `1px solid ${C.line}` }}>
              <p className="text-xl font-extrabold" style={{ ...display, color: C.ink }}>{v}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>{k}</p>
            </div>
          ))}
        </div>
      </Card>
      {(R === "foster" || R === "shelter") && activeSOS.map((s) => {
        const pet = db.pets.find((p) => p.id === s.petId);
        return (
          <Card key={s.id} className="mb-4 p-4" style={{ background: C.dangerSoft, borderColor: C.danger }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><Flame size={20} style={{ color: C.danger }} />
                <p className="text-sm font-extrabold" style={{ ...display, color: C.danger }}>SOS — {pet?.name} needs emergency relocation</p>
              </div>
              <Btn size="sm" kind="danger" onClick={() => onRespondSOS(s.id)}>I can take {pet?.name}</Btn>
            </div>
          </Card>
        );
      })}
      {liveUpdates.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide" style={{ ...display, color: C.muted }}>Live updates</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {liveUpdates.map((u) => {
              const pet = db.pets.find((p) => p.id === u.petId);
              return (
                <button key={u.id} onClick={() => setFocus(u.agId)} className="w-40 shrink-0 text-left">
                  <div className="flex h-24 items-center justify-center rounded-xl text-4xl"
                    style={{ background: C.surface, border: `2px solid ${MOODS[u.mood]?.color || C.trust}` }}>{u.photo}</div>
                  <p className="mt-1.5 truncate text-xs font-bold" style={{ color: C.ink }}>{pet?.name} · {MOODS[u.mood]?.label}</p>
                  <p className="truncate text-xs" style={{ color: C.muted }}>{ago(u.at)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Card className="mb-3 inline-block px-3 py-1.5">
            <h3 className="text-lg font-extrabold" style={{ ...display, color: C.ink }}>
              {R === "owner" ? "Needs your attention" : R === "admin" ? "Queue" : "In your care"}
            </h3>
          </Card>
          <div className="space-y-2">
            {R === "owner" && pendingReq > 0 && (
              <Card className="flex items-center justify-between p-4">
                <p className="text-sm font-semibold" style={{ color: C.ink2 }}>{pendingReq} caregiver(s) have offered to help</p>
                <Btn size="sm" onClick={() => setTab("matches")}>Review</Btn>
              </Card>
            )}
            {myAgs.filter((a) => a.status === "awaiting_signature" && a.caregiverId === me.id).map((a) => (
              <Card key={a.id} className="flex items-center justify-between p-4" style={{ background: C.signalSoft, borderColor: C.signal }}>
                <p className="text-sm font-semibold" style={{ color: C.signal }}>An agreement needs your signature</p>
                <Btn size="sm" kind="trust" onClick={() => setFocus(a.id)}>Open</Btn>
              </Card>
            ))}
            {active.map((a) => {
              const pet = db.pets.find((p) => p.id === a.petId);
              const od  = overdue(db, a);
              return (
                <Card key={a.id} className="flex cursor-pointer items-center justify-between p-4" onClick={() => setFocus(a.id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{pet?.emoji}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.ink }}>{pet?.name}</p>
                      <p className="text-xs" style={{ color: od ? C.danger : C.muted }}>{od ? `Update ${od} days overdue` : "Timeline intact"}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: C.muted }} />
                </Card>
              );
            })}
            {active.length === 0 && pendingReq === 0 && <Card className="p-4"><p className="text-sm" style={{ color: C.muted }}>Nothing needs you right now.</p></Card>}
          </div>
        </div>
        <div>
          <Card className="mb-3 inline-block px-3 py-1.5">
            <h3 className="text-lg font-extrabold" style={{ ...display, color: C.ink }}>Success stories</h3>
          </Card>
          <div className="space-y-2">
            {db.stories.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ ...display, color: C.ink }}>{s.pet}</p>
                    <p className="text-xs leading-relaxed" style={{ color: C.ink2 }}>{s.text}</p>
                    <p className="mt-1 text-xs" style={{ ...mono, color: C.muted }}>{s.by} · {fmt(s.at)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
