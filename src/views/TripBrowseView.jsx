import { Ban, Send, Eye } from "lucide-react";
import { C, fmt, rupee } from "../constants.js";
import { TIER_LABEL } from "../data.js";
import { effectiveTier, tripCost } from "../logic.js";
import { Section, Card, Btn, Pill, Empty, PetHead } from "../primitives.jsx";

export default function TripBrowseView({ db, me, onApply, onOpenBooking }) {
  const open = db.tripListings.filter((l) => l.status === "open");
  const eligible = effectiveTier(db, me) !== "none";
  const myBookings = db.tripBookings.filter((b) => b.sitterId === me.id);

  return (
    <Section title="Trip care" sub="Short drop-in visits — the pet stays in their own home and the owner stays reachable throughout.">
      {!eligible && (
        <div className="mb-4 rounded-lg px-3 py-2.5 text-xs leading-relaxed" style={{ background: C.dangerSoft, color: C.danger }}>
          <Ban size={13} className="mr-1 inline" />
          You need at least {TIER_LABEL.light} to apply — submit your documents from My profile.
        </div>
      )}

      {myBookings.length > 0 && (
        <div className="mb-5 grid gap-2">
          {myBookings.map((b) => {
            const pet = db.pets.find((p) => p.id === b.petId);
            return (
              <Card key={b.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pet.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: C.ink }}>{pet.name}</span>
                  <Pill bg={C.trustSoft} fg={C.trust}>{b.status}</Pill>
                </div>
                <Btn size="sm" kind="ghost" icon={Eye} onClick={() => onOpenBooking(b.id)}>Open</Btn>
              </Card>
            );
          })}
        </div>
      )}

      {open.length === 0
        ? <Empty icon={Send} title="Nothing open right now" sub="New trip-care listings appear here." />
        : <div className="grid gap-3">
            {open.map((l) => {
              const pet = db.pets.find((p) => p.id === l.petId);
              const owner = db.users.find((u) => u.id === l.ownerId);
              const cost = tripCost(l);
              const req = db.tripRequests.find((r) => r.listingId === l.id && r.sitterId === me.id);
              return (
                <Card key={l.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <PetHead pet={pet} />
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: C.ink }}>{rupee(cost.totalAmount)}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{cost.totalVisits} visits</p>
                    </div>
                  </div>
                  <p className="mt-3 border-l-2 pl-3 text-sm italic leading-relaxed" style={{ borderColor: C.line, color: C.ink2 }}>
                    "{l.note}" <span className="not-italic" style={{ color: C.muted }}>— {owner.name}, {l.city} · {fmt(l.startDate)} → {fmt(l.endDate)} · {l.frequency}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {req ? <Pill bg={C.primarySoft} fg={C.primary}>Request {req.status}</Pill>
                      : eligible ? <Btn size="sm" icon={Send} onClick={() => onApply(l)}>Offer to help</Btn>
                        : <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.danger }}>
                            <Ban size={13} /> Needs {TIER_LABEL.light.toLowerCase()}
                          </span>}
                  </div>
                </Card>
              );
            })}
          </div>}
    </Section>
  );
}
