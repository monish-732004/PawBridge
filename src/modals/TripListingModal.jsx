import { useState } from "react";
import { C, now, DAY } from "../constants.js";
import { TRIP_FREQUENCIES, TRIP_TASKS } from "../data.js";
import { tripCost } from "../logic.js";
import { Modal, Field, Sel, Input, Area, Btn, Check2 } from "../primitives.jsx";

export default function TripListingModal({ pet, onClose, onSave }) {
  const [f, setF] = useState({
    startDate: new Date(now() + 3 * DAY).toISOString().slice(0, 10),
    endDate: new Date(now() + 5 * DAY).toISOString().slice(0, 10),
    frequency: "2x daily",
    tasks: { feeding: true, walking: true, medication: false, playtime: false },
    rateType: "perVisit",
    rate: 250,
    note: "",
  });
  const s = (k, v) => setF({ ...f, [k]: v });
  const toggleTask = (k, v) => setF({ ...f, tasks: { ...f.tasks, [k]: v } });

  const validRange = new Date(f.endDate) >= new Date(f.startDate);
  const preview = validRange ? tripCost({
    startDate: new Date(f.startDate).getTime(), endDate: new Date(f.endDate).getTime(),
    frequency: f.frequency, rateType: f.rateType, rate: +f.rate || 0,
  }) : null;

  return (
    <Modal title={`Book a sitter for ${pet.name}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Trip starts"><Input type="date" value={f.startDate} onChange={(e) => s("startDate", e.target.value)} /></Field>
          <Field label="Trip ends"><Input type="date" value={f.endDate} onChange={(e) => s("endDate", e.target.value)} /></Field>
          <Field label="Visit frequency"><Sel value={f.frequency} onChange={(e) => s("frequency", e.target.value)}>
            {TRIP_FREQUENCIES.map((fr) => <option key={fr}>{fr}</option>)}</Sel></Field>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>What should each visit cover?</p>
          <div className="flex flex-wrap gap-4">
            {Object.keys(TRIP_TASKS).map((k) => (
              <Check2 key={k} label={TRIP_TASKS[k].label} checked={!!f.tasks[k]} onChange={(v) => toggleTask(k, v)} />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Rate type"><Sel value={f.rateType} onChange={(e) => s("rateType", e.target.value)}>
            <option value="perVisit">Per visit</option><option value="perDay">Per day</option></Sel></Field>
          <Field label={`Rate (₹ per ${f.rateType === "perDay" ? "day" : "visit"})`}>
            <Input type="number" value={f.rate} onChange={(e) => s("rate", +e.target.value)} /></Field>
        </div>

        <Field label="Anything the sitter should know">
          <Area value={f.note} onChange={(e) => s("note", e.target.value)}
            placeholder="Miso needs his insulin at 8am and 8pm without fail." />
        </Field>

        {preview && (
          <p className="rounded-lg px-3 py-2.5 text-xs leading-relaxed" style={{ background: C.paper, color: C.muted }}>
            {preview.totalVisits} visit{preview.totalVisits === 1 ? "" : "s"} · <b style={{ color: C.ink2 }}>₹{preview.totalAmount.toLocaleString("en-IN")}</b> total,
            held in escrow the moment you accept a sitter and released when the trip ends. Light-tier verified sitters and above can apply.
          </p>
        )}

        <Btn full disabled={!f.note.trim() || !validRange} onClick={() => onSave({
          petId: pet.id, startDate: new Date(f.startDate).getTime(), endDate: new Date(f.endDate).getTime(),
          frequency: f.frequency, tasks: f.tasks, rateType: f.rateType, rate: +f.rate, note: f.note,
        })}>Post trip-care listing</Btn>
      </div>
    </Modal>
  );
}
