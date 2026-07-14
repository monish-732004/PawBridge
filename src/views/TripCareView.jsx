import { PawPrint, Eye } from "lucide-react";
import { C, mono, fmt, rupee } from "../constants.js";
import { tripCost, trustScore } from "../logic.js";
import { Section, Card, Btn, Pill, Empty, VBadge, Trust } from "../primitives.jsx";

export default function TripCareView({ db, me, onAcceptTrip, onOpenBooking }) {
  const mine = db.tripListings.filter((l) => l.ownerId === me.id);

  return (
    <Section title="Trip care" sub="Short drop-in visits while you're away — the pet stays home, you stay reachable, and every visit is logged with a photo.">
      {mine.length === 0
        ? <Empty icon={PawPrint} title="No trip-care listings yet" sub="Post one from a pet's card on the My pets tab." />
        : <div className="grid gap-3">
            {mine.map((l) => {
              const pet = db.pets.find((p) => p.id === l.petId);
              const cost = tripCost(l);
              const reqs = db.tripRequests.filter((r) => r.listingId === l.id && r.status === "pending");
              const booking = db.tripBookings.find((b) => b.listingId === l.id);
              return (
                <Card key={l.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{pet.emoji}</span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: C.ink }}>{pet.name}</p>
                        <p className="text-xs" style={{ ...mono, color: C.muted }}>{fmt(l.startDate)} → {fmt(l.endDate)} · {l.frequency}</p>
                      </div>
                    </div>
                    <Pill bg={l.status === "open" ? C.signalSoft : l.status === "completed" ? C.paper : C.trustSoft}
                      fg={l.status === "open" ? C.signal : l.status === "completed" ? C.muted : C.trust}>{l.status}</Pill>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: C.muted }}>{cost.totalVisits} visits · {rupee(cost.totalAmount)} total</p>

                  {l.status === "open" && reqs.length === 0 && (
                    <p className="mt-3 text-xs" style={{ color: C.muted }}>No offers yet.</p>
                  )}
                  {l.status === "open" && reqs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {reqs.map((r) => {
                        const sitter = db.users.find((u) => u.id === r.sitterId);
                        return (
                          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg p-3" style={{ background: C.paper }}>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold" style={{ color: C.ink }}>{sitter.avatar} {sitter.name}</span>
                                <VBadge db={db} u={sitter} />
                                <Trust score={trustScore(db, sitter)} />
                              </div>
                              <p className="mt-1 text-xs" style={{ color: C.ink2 }}>{r.note}</p>
                            </div>
                            <Btn size="sm" kind="trust" onClick={() => onAcceptTrip(l.id, r.sitterId)}>Accept & pay {rupee(cost.totalAmount)}</Btn>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {booking && (
                    <div className="mt-3">
                      <Btn size="sm" kind="ghost" icon={Eye} onClick={() => onOpenBooking(booking.id)}>View trip</Btn>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>}
    </Section>
  );
}
