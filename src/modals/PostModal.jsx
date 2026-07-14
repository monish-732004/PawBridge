import { useState } from "react";
import { Send } from "lucide-react";
import { FORUM_CATS } from "../data.js";
import { Modal, Field, Sel, Input, Area, Btn } from "../primitives.jsx";

export default function PostModal({ onClose, onSave }) {
  const [f, setF] = useState({ cat: FORUM_CATS[1], title: "", body: "" });
  const s = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title="New post" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Category"><Sel value={f.cat} onChange={(e) => s("cat", e.target.value)}>
          {FORUM_CATS.map((c) => <option key={c}>{c}</option>)}</Sel></Field>
        <Field label="Title"><Input value={f.title} onChange={(e) => s("title", e.target.value)} placeholder="Foster dog won't settle at night — what worked for you?" /></Field>
        <Field label="Post"><Area value={f.body} onChange={(e) => s("body", e.target.value)} placeholder="Second week and he still paces until 2am…" /></Field>
        <Btn full icon={Send} disabled={!f.title.trim() || !f.body.trim()} onClick={() => onSave(f)}>Post</Btn>
      </div>
    </Modal>
  );
}
