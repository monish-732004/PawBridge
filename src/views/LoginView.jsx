import { useState } from "react";
import { C, display, body } from "../constants.js";
import { Card, Field, Input, Btn } from "../primitives.jsx";

export default function LoginView({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password || busy) return;
    setBusy(true); setError("");
    try {
      await onLogin({ email, password });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{ background: `url(/dog-and-owner.jpg) center/cover no-repeat`, ...body }}>
      <div className="fixed left-6 top-6 flex items-center gap-3">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl shadow-lg" style={{ border: "3px solid #fff" }}>
          <img src="/logo.jpg" alt="PawBridge" className="h-full w-full object-cover" />
        </div>
        <p className="text-2xl font-extrabold" style={{ ...display, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,.8)" }}>PawBridge</p>
      </div>
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <img src="/logo.jpg" alt="PawBridge" className="h-full w-full object-cover" />
          </div>
          <p className="text-lg font-extrabold" style={{ ...display, color: C.ink }}>PawBridge</p>
        </div>
        <h1 className="mb-4 text-xl font-extrabold" style={{ ...display, color: C.ink }}>Log in</h1>
        <div className="space-y-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" />
          </Field>
          {error && <p className="text-xs font-semibold" style={{ color: C.danger }}>{error}</p>}
          <Btn full disabled={!email || !password || busy} onClick={submit}>{busy ? "Logging in…" : "Log in"}</Btn>
        </div>
        <p className="mt-4 text-center text-xs" style={{ color: C.muted }}>
          New here? <button onClick={onSwitchToSignup} className="font-bold underline" style={{ color: C.primary }}>Create an account</button>
        </p>
      </Card>
    </div>
  );
}
