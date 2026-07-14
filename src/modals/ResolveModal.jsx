import { C } from "../constants.js";
import { trustScore } from "../logic.js";
import { Modal, Card, Btn, VBadge, Trust } from "../primitives.jsx";

export default function ResolveModal({ db, s, onClose, onPick }) {
  const pet = db.pets.find((p) => p.id === s.petId);
  return (
    <Modal title={`Choose who takes ${pet.name}`} onClose={onClose}>
      <p className="mb-3 text-sm" style={{ color: C.muted }}>
        These caregivers responded to the SOS. Picking one moves {pet.name} immediately and continues the timeline unbroken under the new home.
      </p>
      <div className="space-y-2">
        {s.responders.map((rid) => {
          const u = db.users.find((x) => x.id === rid);
          return (
            <Card key={rid} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{u.avatar}</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.ink }}>{u.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2"><VBadge db={db} u={u} /><Trust score={trustScore(db, u)} /></div>
                </div>
              </div>
              <Btn size="sm" kind="trust" onClick={() => onPick(rid)}>Move {pet.name} here</Btn>
            </Card>
          );
        })}
      </div>
    </Modal>
  );
}
