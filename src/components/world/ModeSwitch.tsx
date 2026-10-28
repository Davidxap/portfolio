import Link from "next/link";
import type { Locale } from "@/data/projects";
import { directPath, homePath } from "@/i18n/ui";
import { useW } from "@/i18n/world";

/** Two-state mode switch "Interactive · Direct". The active mode is a non-link span with aria-current; the other is a plain link to its page,
 * so it works without JS, with the keyboard and on touch. Used on the world map (next to the identity) and at the top of the direct view. */
export function ModeSwitch({ locale, mode }: { locale: Locale; mode: "interactive" | "direct" }) {
  const w = useW(locale);
  const items = [
    { id: "interactive", href: homePath(locale), label: w("mode.interactive"), hint: w("mode.hintInteractive") },
    { id: "direct", href: directPath(locale), label: w("mode.direct"), hint: w("mode.hintDirect") },
  ] as const;
  return (
    <nav className="mode-switch no-print" aria-label={w("mode.label")} data-mode={mode}>
      <span className="mode-thumb" aria-hidden="true" />
      {items.map((i) => i.id === mode
        ? <span key={i.id} className="mode-opt on" aria-current="page"><b>{i.label}</b><small>{i.hint}</small></span>
        : <Link key={i.id} className="mode-opt" href={i.href}><b>{i.label}</b><small>{i.hint}</small></Link>)}
    </nav>
  );
}
