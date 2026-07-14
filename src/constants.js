/* ═══════════════════════════════════════════════════════════════
   PawBridge — constants, colours, typography & utility helpers
   ═══════════════════════════════════════════════════════════════ */

export const C = {
  ink: "#0F1E24", ink2: "#31474F", muted: "#6E858D",
  paper: "#EDF2F0", surface: "#FFFFFF", line: "#D5E0DC",
  trust: "#1F6F5C", trustSoft: "#E3F0EB",
  primary: "#27508F", primarySoft: "#E5EBF5",
  signal: "#B37010", signalSoft: "#FAEEDA",
  danger: "#A93544", dangerSoft: "#F7E4E6",
  violet: "#5B4B8A", violetSoft: "#EBE7F3",
};

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');`;
export const display = { fontFamily: "'Bricolage Grotesque','Trebuchet MS',sans-serif" };
export const body    = { fontFamily: "'Inter',system-ui,sans-serif" };
export const mono    = { fontFamily: "'JetBrains Mono',ui-monospace,monospace" };

export const DAY = 86400000;
export const now   = () => Date.now();
export const uid   = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;
export const avg   = (a) => (a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
export const rupee = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
export const fmt   = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const fmtShort = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const ago   = (t) => {
  const m = Math.floor((now() - t) / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
};
