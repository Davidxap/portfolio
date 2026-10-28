import { availability } from "@/data/about";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { useT } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { ModeSwitch } from "./ModeSwitch";
import { LiveTime } from "./LiveTime";
import { Visited } from "./Visited";

/** The identity widget on the bare desktop: the first five seconds, and the page's only h1. It sits over the dark margin of the painting. */
export function WorldIntro({ locale }: { locale: Locale }) {
  const t = useT(locale);
  const w = useW(locale);
  const [first, ...rest] = person.name.split(" ");
  return (
    <section className="intro" aria-labelledby="map-title">
      <p className="intro-sign mono">{w("intro.sign")} · <LiveTime label={w("clock.tip")} /></p>
      <h1 id="map-title">{first} <em>{rest.join(" ")}</em></h1>
      <p className="intro-role mono">{person.jobTitle}</p>
      <ModeSwitch locale={locale} mode="interactive" />
      <p className="intro-value">{t("map.value")}</p>
      <div className="intro-avail">
        <span className="intro-avail-label mono">{w("intro.availability")}</span>
        <ul className="chips" aria-label={availability.line[locale]}>
          {availability.modes.map((m) => <li key={m.en} className="chip chip-accent2">{m[locale]}</li>)}
        </ul>
      </div>
      <p className="intro-links">
        <span className="intro-visited mono tiny">{w("intro.visited")}: <Visited /></span>
      </p>
      <p className="intro-hint mono tiny">{w("intro.hint")}</p>
    </section>
  );
}
