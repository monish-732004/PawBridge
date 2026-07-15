/* Empty string preserves the existing relative-path behavior for local dev
   (still proxied by Vite to localhost:3001). In production, set VITE_API_URL
   to the deployed backend's URL (e.g. https://<app>.fly.dev). */
const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error((body && body.error) || "Request failed");
  return body;
}

export const signup = (payload) => request("/signup", { method: "POST", body: JSON.stringify(payload) });
export const login = (payload) => request("/login", { method: "POST", body: JSON.stringify(payload) });
export const logout = () => request("/logout", { method: "POST" });

export async function getMe() {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to check session");
  return res.json();
}

export const getData = () => request("/data");
export const putData = (data) => request("/data", { method: "PUT", body: JSON.stringify(data) });
