import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { C, now, DAY } from "../constants.js";
import { Modal, Field, Sel, Input, Btn } from "../primitives.jsx";

export default function BookModal({ pet, onClose, onBook }) {
  const [f, setF] = useState({ type: "Check-up", clinic: "Ernakulam Vet Clinic", date: new Date(now() + 3 * DAY).toISOString().slice(0, 10) });
  const s = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title={`Book a vet for ${pet.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Appointment type"><Sel value={f.type} onChange={(e) => s("type", e.target.value)}>
          <option>Vaccination</option><option>Check-up</option><option>Surgery</option></Sel></Field>
        <Field label="Clinic"><Sel value={f.clinic} onChange={(e) => s("clinic", e.target.value)}>
          <option>Ernakulam Vet Clinic</option><option>Kochi Animal Hospital</option><option>Dr. Anand Pillai — Home visit</option></Sel></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={(e) => s("date", e.target.value)} /></Field>
        <p className="rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: C.paper, color: C.muted }}>
          The appointment and everything the vet records go onto {pet.name}'s permanent medical history — which belongs to {pet.name}, not to whoever currently holds them.
        </p>
        <Btn full icon={CalendarCheck} onClick={() => onBook({ type: f.type, clinic: f.clinic, at: new Date(f.date).getTime() })}>Book appointment</Btn>
      </div>
    </Modal>
  );
}
