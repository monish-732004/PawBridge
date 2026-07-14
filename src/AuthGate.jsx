import { useState, useEffect } from "react";
import { C, body } from "./constants.js";
import { getMe, login, signup, logout } from "./api.js";
import LoginView from "./views/LoginView.jsx";
import SignupView from "./views/SignupView.jsx";
import PawBridge from "./PawBridge.jsx";

export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [screen, setScreen] = useState("login");

  useEffect(() => {
    getMe().then(setSession).catch(() => setSession(null));
  }, []);

  const handleLogin = async (creds) => setSession(await login(creds));
  const handleSignup = async (payload) => setSession(await signup(payload));
  const handleLogout = async () => { await logout(); setSession(null); setScreen("login"); };

  if (session === undefined) {
    return <div className="flex h-screen items-center justify-center" style={{ background: C.paper, ...body, color: C.muted }}>Loading PawBridge…</div>;
  }

  if (!session) {
    return screen === "login"
      ? <LoginView onLogin={handleLogin} onSwitchToSignup={() => setScreen("signup")} />
      : <SignupView onSignup={handleSignup} onSwitchToLogin={() => setScreen("login")} />;
  }

  return <PawBridge sessionUser={session} onLogout={handleLogout} />;
}
