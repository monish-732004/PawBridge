import { Wallet, IndianRupee, Stethoscope, Check } from "lucide-react";
import { C, display, mono, rupee, fmt, fmtShort } from "../constants.js";
import { EXPENSE_CATS } from "../data.js";
import { Section, Stat, Card, Empty, Pill, Btn } from "../primitives.jsx";

export default function MoneyView({ db, me, onReimburse }) {
  const myAgs = db.agreements.filter((a) => a.ownerId === me.id);
  const exs = db.expenses.filter((e) => myAgs.some((a) => a.id === e.agId));
  const apps = db.appointments.filter((a) => {
    const p = db.pets.find((x) => x.id === a.petId);
    return p && p.ownerId === me.id;
  });
  const total = exs.reduce((a, b) => a + b.amount, 0);
  const owing = exs.filter((e) => !e.reimbursed).reduce((a, b) => a + b.amount, 0);

  return (
    <Section title="Expenses & vet" sub="Caregivers log what they spend. You reimburse in one tap. Nothing above the agreed cap happens without you.">
      {exs.length === 0 && apps.length === 0
        ? <Empty icon={Wallet} title="Nothing spent yet" sub="Expenses your caregiver logs will appear here." />
        : <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat k="Total spent" v={rupee(total)} col={C.ink} icon={IndianRupee} />
              <Stat k="Awaiting reimbursement" v={rupee(owing)} col={owing ? C.danger : C.trust} icon={Wallet} />
              <Stat k="Vet visits" v={apps.length} col={C.trust} icon={Stethoscope} />
            </div>

            <Card className="mt-3 p-5">
              <p className="mb-3 text-sm font-extrabold" style={{ ...display }}>By category</p>
              <div className="space-y-2.5">
                {Object.keys(EXPENSE_CATS).map((c) => {
                  const I = EXPENSE_CATS[c];
                  const v = exs.filter((e) => e.cat === c).reduce((a, b) => a + b.amount, 0);
                  return (
                    <div key={c} className="flex items-center gap-3">
                      <span className="inline-flex w-28 shrink-0 items-center gap-1.5 text-xs font-semibold capitalize" style={{ color: C.ink2 }}>
                        <I size={13} />{c}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: C.line }}>
                        <div className="h-full rounded-full" style={{ width: `${total ? (v / total) * 100 : 0}%`, background: C.trust }} />
                      </div>
                      <span className="w-20 text-right text-xs" style={{ ...mono, color: C.muted }}>{rupee(v)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="mt-3 overflow-hidden">
              <p className="px-5 pt-5 text-sm font-extrabold" style={{ ...display }}>All expenses</p>
              <div className="mt-3">
                {exs.slice().reverse().map((e) => {
                  const pet = db.pets.find((p) => p.id === e.petId);
                  const who = db.users.find((u) => u.id === e.by);
                  const I = EXPENSE_CATS[e.cat];
                  return (
                    <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3" style={{ borderTop: `1px solid ${C.line}` }}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.paper }}>
                          <I size={14} style={{ color: C.ink2 }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: C.ink }}>{e.note}</p>
                          <p className="text-xs" style={{ ...mono, color: C.muted }}>{pet.name} · {who.name} · {fmtShort(e.at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold" style={{ ...mono, color: C.ink }}>{rupee(e.amount)}</span>
                        {e.reimbursed ? <Pill icon={Check} bg={C.trustSoft} fg={C.trust}>Reimbursed</Pill>
                          : <Btn size="sm" icon={IndianRupee} onClick={() => onReimburse(e.id)}>Reimburse</Btn>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="mt-3 p-5">
              <p className="mb-3 text-sm font-extrabold" style={{ ...display }}>Medical record</p>
              {apps.length === 0 ? <p className="text-xs" style={{ color: C.muted }}>No appointments yet.</p>
                : apps.map((a) => {
                    const pet = db.pets.find((p) => p.id === a.petId);
                    return (
                      <div key={a.id} className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${C.line}` }}>
                        <div className="flex items-center gap-2">
                          <Stethoscope size={14} style={{ color: C.trust }} />
                          <div>
                            <p className="text-sm font-bold" style={{ color: C.ink }}>{a.type} · {pet.name}</p>
                            <p className="text-xs" style={{ color: C.muted }}>{a.clinic} · {fmt(a.at)}</p>
                          </div>
                        </div>
                        <Pill bg={a.status === "completed" ? C.trustSoft : C.signalSoft} fg={a.status === "completed" ? C.trust : C.signal}>{a.status}</Pill>
                      </div>
                    );
                  })}
              <p className="mt-3 text-xs leading-relaxed" style={{ color: C.muted }}>
                This record belongs to the animal, not to whoever currently holds them. It travels to the next home.
              </p>
            </Card>
          </>}
    </Section>
  );
}
