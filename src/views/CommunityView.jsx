import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { C, display, mono, ago } from "../constants.js";
import { FORUM_CATS } from "../data.js";
import { Section, Btn, Card, Pill, Input } from "../primitives.jsx";

export default function CommunityView({ db, onPost, onReply }) {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState("");
  const posts = db.forum.filter((f) => cat === "All" || f.cat === cat).sort((a, b) => b.at - a.at);

  return (
    <Section title="Community" sub="Lost pets, training, nutrition, and the stories that make people say yes."
      action={<Btn icon={Plus} onClick={onPost}>New post</Btn>}>
      <div className="mb-4 flex flex-wrap gap-2">
        {["All"].concat(FORUM_CATS).map((c) => (
          <button key={c} onClick={() => setCat(c)} className="rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: cat === c ? C.ink : C.surface, color: cat === c ? "#fff" : C.muted, border: `1px solid ${cat === c ? C.ink : C.line}` }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {posts.map((f) => {
          const au = db.users.find((u) => u.id === f.by);
          const isOpen = open === f.id;
          return (
            <Card key={f.id} className="p-4">
              <Pill bg={f.cat === "Lost Pets" ? C.dangerSoft : C.paper} fg={f.cat === "Lost Pets" ? C.danger : C.muted}>{f.cat}</Pill>
              <h4 className="mt-1.5 text-base font-extrabold leading-snug" style={{ ...display, color: C.ink }}>{f.title}</h4>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: C.ink2 }}>{f.body}</p>
              <p className="mt-1.5 text-xs" style={{ ...mono, color: C.muted }}>
                {au.avatar} {au.name} · {ago(f.at)} · {f.replies.length} repl{f.replies.length === 1 ? "y" : "ies"}
              </p>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: C.line }}>
                  {f.replies.map((r, i) => {
                    const ru = db.users.find((u) => u.id === r.by);
                    return (
                      <div key={i} className="rounded-lg p-3" style={{ background: C.paper }}>
                        <p className="text-sm leading-relaxed" style={{ color: C.ink2 }}>{r.text}</p>
                        <p className="mt-1 text-xs" style={{ ...mono, color: C.muted }}>{ru.avatar} {ru.name} · {ago(r.at)}</p>
                      </div>
                    );
                  })}
                  <div className="flex gap-2">
                    <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a reply" />
                    <Btn icon={Send} disabled={!draft.trim()} onClick={() => { onReply(f.id, draft.trim()); setDraft(""); }}>Reply</Btn>
                  </div>
                </div>
              )}

              <button onClick={() => { setOpen(isOpen ? null : f.id); setDraft(""); }}
                className="mt-2 text-xs font-bold" style={{ color: C.primary }}>
                {isOpen ? "Hide replies" : "Open thread"}
              </button>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
