async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
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
  const res = await fetch("/api/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to check session");
  return res.json();
}

export const getData = () => request("/data");
export const putData = (data) => request("/data", { method: "PUT", body: JSON.stringify(data) });
