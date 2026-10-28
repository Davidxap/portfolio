import type { Locale } from "@/data/projects";
import { person, stack, stackLearning } from "@/data/site";
import { useT, type UiKey } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { PlaceNav } from "../world/PlaceNav";
import { PixelDavid } from "../world/PixelDavid";

const TONES = ["tc1", "tc2", "tc3", "tc4", "tc5", "tc6"] as const;

/** Stack as a fastfetch screen: the pixel figure as the logo block, `david@manizales`, then one coloured `key: value` row per stack group
 * and what is being learned now, closed by the colour strip every fetch tool prints. */
export function StackPanel({ locale, embedded }: { locale: Locale; embedded?: boolean }) {
  const t = useT(locale);
  const w = useW(locale);
  const groups = Object.entries(stack) as [keyof typeof stack, readonly string[]][];
  return (
    <article className="panel fetch-app" aria-labelledby="stack-title">
      <div className="fetch">
        <div className="fetch-logo" aria-hidden="true"><PixelDavid height={190} className="fetch-px" /></div>
        <div className="fetch-info">
          <p className="fetch-host mono"><span className="fh-user">david</span><span className="fh-at">@</span><span className="fh-host">manizales</span></p>
          <span className="fetch-rule" aria-hidden="true" />
          <h1 id="stack-title" className="fetch-h1">{w("head.stack")}</h1>
          <p className="t-dim">{w("head.stack.lead")}</p>
          <dl className="fetch-rows mono">
            <div className="fr" style={{ "--c": "var(--tc1)" } as React.CSSProperties}><dt>Role</dt><dd>{person.jobTitle}</dd></div>
            <div className="fr" style={{ "--c": "var(--tc2)" } as React.CSSProperties}><dt>Location</dt><dd>Manizales, Colombia</dd></div>
            {groups.map(([k, items], i) => (
              <div className="fr" key={k} style={{ "--c": `var(--${TONES[(i + 2) % TONES.length]})` } as React.CSSProperties}>
                <dt>{t(`inv.${k}` as UiKey)}</dt>
                <dd><ul className="fr-items" aria-label={`${t(`inv.${k}` as UiKey)}: ${items.length} ${w("stack.count")}`}>{items.map((x) => <li key={x}>{x}</li>)}</ul></dd>
              </div>
            ))}
            {stackLearning.length > 0 && (
              <div className="fr fr-learn" style={{ "--c": "var(--cta)" } as React.CSSProperties}>
                <dt>{w("stack.learning")}</dt>
                <dd><ul className="fr-items">{stackLearning.map((n) => <li key={n.en}>{n[locale]}</li>)}</ul></dd>
              </div>
            )}
          </dl>
          <div className="fetch-strip" aria-hidden="true">{TONES.map((c) => <span key={c} style={{ background: `var(--${c})` }} />)}</div>
        </div>
      </div>
      {!embedded && <PlaceNav locale={locale} place="stack" />}
    </article>
  );
}
