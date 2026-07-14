import { useState } from "react";
import { C, display, body } from "../constants.js";
import { Card, Field, Input, Sel, Btn } from "../primitives.jsx";

export default function SignupView({ onSignup, onSwitchToLogin }) {
  const [f, setF] = useState({ name: "", email: "", password: "", role: "owner", city: "Kochi" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const s = (k, v) => setF({ ...f, [k]: v });

  const submit = async () => {
    if (!f.name || !f.email || f.password.length < 8 || busy) return;
    setBusy(true); setError("");
    try {
      await onSignup(f);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: `url(/dog-and-owner.jpg) center/cover no-repeat`, ...body }}>
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <img src="/logo.jpg" alt="PawBridge" className="h-full w-full object-cover" />
          </div>
          <p className="text-lg font-extrabold" style={{ ...display, color: C.ink }}>PawBridge</p>
        </div>
        <h1 className="mb-4 text-xl font-extrabold" style={{ ...display, color: C.ink }}>Create an account</h1>
        <div className="space-y-3">
          <Field label="Name"><Input value={f.name} onChange={(e) => s("name", e.target.value)} placeholder="Priya Menon" /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={(e) => s("email", e.target.value)} placeholder="you@example.com" /></Field>
          <Field label="Password">
            <Input type="password" value={f.password} onChange={(e) => s("password", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="At least 8 characters" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="I am a…"><Sel value={f.role} onChange={(e) => s("role", e.target.value)}>
              <option value="owner">Pet owner</option>
              <option value="foster">Foster / sitter</option>
              <option value="shelter">Shelter</option>
            </Sel></Field>
            <Field label="City"><Input value={f.city} onChange={(e) => s("city", e.target.value)} placeholder="Kochi" /></Field>
          </div>
          {error && <p className="text-xs font-semibold" style={{ color: C.danger }}>{error}</p>}
          <Btn full disabled={!f.name || !f.email || f.password.length < 8 || busy} onClick={submit}>
            {busy ? "Creating account…" : "Create account"}
          </Btn>
        </div>
        <p className="mt-4 text-center text-xs" style={{ color: C.muted }}>
          Already have an account? <button onClick={onSwitchToLogin} className="font-bold underline" style={{ color: C.primary }}>Log in</button>
        </p>
      </Card>
    </div>
  );
}
