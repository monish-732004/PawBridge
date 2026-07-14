import { useState } from "react";
import { Upload, Wallet } from "lucide-react";
import { C, rupee } from "../constants.js";
import { EXPENSE_CATS } from "../data.js";
import { Modal, Field, Sel, Input, Btn } from "../primitives.jsx";

export default function ExpenseModal({ pet, cap, onClose, onSave }) {
  const [f, setF] = useState({ cat: "food", amount: 500, note: "" });
  const s = (k, v) => setF({ ...f, [k]: v });
  const over = f.cat === "vet" && f.amount > cap;
  return (
    <Modal title={`Log an expense for ${pet.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Category"><Sel value={f.cat} onChange={(e) => s("cat", e.target.value)}>
          {Object.keys(EXPENSE_CATS).map((c) => <option key={c} value={c}>{c}</option>)}</Sel></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₹)"><Input type="number" value={f.amount} onChange={(e) => s("amount", +e.target.value)} /></Field>
          <Field label="Receipt">
            <div className="flex h-[38px] items-center justify-center gap-1.5 rounded-lg text-xs font-semibold"
              style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.muted }}><Upload size={13} />Attached</div>
          </Field>
        </div>
        <Field label="What was it for"><Input value={f.note} onChange={(e) => s("note", e.target.value)} placeholder="Kibble, 10kg" /></Field>
        {over && (
          <p className="rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: C.dangerSoft, color: C.danger }}>
            This is above the {rupee(cap)} medical cap in the agreement. The owner must approve it <b>before</b> treatment — message them first.
          </p>
        )}
        <Btn full disabled={!f.note.trim() || !f.amount} icon={Wallet} onClick={() => onSave(f)}>Log {rupee(f.amount)}</Btn>
      </div>
    </Modal>
  );
}
