// "Places visited" counter: a curiosity hook kept in localStorage. Storage can be unavailable, so every access is guarded.
const KEY = "visited";

export function readVisited(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; }
}

export function markVisited(id: string): string[] {
  const all = readVisited();
  if (all.includes(id)) return all;
  const next = [...all, id];
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  try { window.dispatchEvent(new Event("visited:change")); } catch { /* ignore */ }
  return next;
}
