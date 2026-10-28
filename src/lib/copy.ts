export async function copyText(v: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(v); return true; } catch { /* fall through */ }
  const ta = document.createElement("textarea");
  ta.value = v; ta.style.cssText = "position:fixed;opacity:0";
  document.body.append(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { /* ignore */ }
  ta.remove();
  return ok;
}
