import { PawPrint, Users, Trophy, Siren, AlertTriangle, TrendingUp } from "lucide-react";
import { C, display, mono } from "../constants.js";
import { DURATIONS } from "../data.js";
import { updateStats, trustScore, overdue, effectiveTier } from "../logic.js";
import { Section, Stat, Card, Trust } from "../primitives.jsx";

export default function AnalyticsView({ db }) {
  const caregivers = db.users.filter((u) => u.role === "foster" || u.role === "shelter");
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const growth = [3, 5, 8, 11, 14, db.agreements.length + 14];
  const maxG = Math.max.apply(null, growth);

  return (
    <Section title="Analytics" sub="What the platform is actually doing.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat k="Total pets" v={db.pets.length} col={C.ink} icon={PawPrint} />
        <Stat k="Active foster homes" v={db.users.filter((u) => u.role === "foster" && effectiveTier(db, u) === "deep" && !u.banned).length} col={C.trust} icon={Users} />
        <Stat k="Adoptions" v={db.agreements.filter((a) => a.duration === "adopt" && a.status !== "declined").length} col={C.signal} icon={Trophy} />
        <Stat k="Emergency cases" v={db.sos.length} col={C.danger} icon={Siren} />
        <Stat k="Broken timelines" v={db.agreements.filter((a) => overdue(db, a) > 0).length} col={C.danger} icon={AlertTriangle} />
      </div>

      <Card className="mt-3 p-5">
        <p className="text-sm font-extrabold" style={{ ...display }}>Monthly growth — placements</p>
        <div className="mt-5 flex h-32 items-end gap-3">
          {growth.map((g, i) => (
            <div key={months[i]} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-bold" style={{ ...mono, color: C.ink2 }}>{g}</span>
              <div className="w-full rounded-t-md" style={{ height: `${(g / maxG) * 100}%`, background: i === growth.length - 1 ? C.trust : C.line }} />
              <span className="text-xs font-semibold" style={{ color: C.muted }}>{months[i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.trust }}>
          <TrendingUp size={13} /> Growing month on month
        </p>
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-extrabold" style={{ ...display }}>Update compliance by caregiver</p>
          <div className="mt-4 space-y-3">
            {caregivers.map((u) => {
              const s = updateStats(db, u.id);
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-xs font-semibold" style={{ color: C.ink2 }}>{u.avatar} {u.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: C.line }}>
                    <div className="h-full rounded-full" style={{ width: `${s.rate * 100}%`, background: s.rate >= .9 ? C.trust : s.rate >= .6 ? C.signal : C.danger }} />
                  </div>
                  <span className="w-12 text-right text-xs" style={{ ...mono, color: C.muted }}>{s.on}/{s.due}</span>
                  <Trust score={trustScore(db, u)} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-extrabold" style={{ ...display }}>Placements by duration</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Object.keys(DURATIONS).map((k) => {
              const v = DURATIONS[k];
              const n = db.listings.filter((l) => l.duration === k).length;
              return (
                <div key={k} className="rounded-lg p-3 text-center" style={{ background: v.permanent ? C.signalSoft : C.paper }}>
                  <p className="text-2xl font-extrabold" style={{ ...display, color: v.permanent ? C.signal : C.ink }}>{n}</p>
                  <p className="text-[10px] font-semibold" style={{ color: C.muted }}>{v.label}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: C.muted }}>
            A healthy platform tips toward temporary fostering. If adoption climbs, the funnel is failing to offer people a way to keep their animal.
          </p>
        </Card>
      </div>
    </Section>
  );
}
