import { useState } from "react";
import { Send } from "lucide-react";
import { C, fmt } from "../constants.js";
import { Modal, Area, Btn } from "../primitives.jsx";

export default function TripApplyModal({ pet, listing, onClose, onSend }) {
  const [note, setNote] = useState("");
  return (
    <Modal title={`Offer to drop in on ${pet.name}`} onClose={onClose}>
      <p className="mb-3 text-sm leading-relaxed" style={{ color: C.muted }}>
        {pet.name} stays in their own home and the owner stays reachable throughout — this is a supervised-by-proximity arrangement, not a custody transfer.
      </p>
      <p className="mb-3 rounded-lg px-3 py-2 text-xs" style={{ background: C.paper, color: C.muted }}>
        {listing.frequency} visits, {fmt(listing.startDate)} → {fmt(listing.endDate)}.
      </p>
      <Area value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="I'm nearby and free that weekend — happy to send photos after each visit." />
      <div className="mt-3"><Btn full icon={Send} disabled={!note.trim()} onClick={() => onSend(note)}>Send request</Btn></div>
    </Modal>
  );
}
