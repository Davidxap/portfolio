"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { cvPath, homePath, useT } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { isMuted, onMuteChange, play, setMuted } from "@/lib/sound";
import { ThemeMenu } from "../ThemeMenu";
import { BrandMark } from "./BrandMark";
import { ArtIcon } from "./icons";
import { withBase } from "@/lib/base";

/** The settings cluster shared by both bars: theme, EN/ES and sound. */
export function Settings({ locale, altPath }: { locale: Locale; altPath: string }) {
  const t = useT(locale);
  const w = useW(locale);
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); return onMuteChange(setMutedState); }, []);
  return (
    <div className="settings" role="group" aria-label={w("top.settings")}>
      <ThemeMenu locale={locale} />
      <div className="lang-switch" role="group" aria-label="Language / Idioma">
        {(["en", "es"] as const).map((l) => l === locale
          ? <span key={l} className="lang-opt on" aria-current="true" lang={l}>{l.toUpperCase()}</span>
          : <a key={l} className="lang-opt" href={withBase(altPath)} hrefLang={l} lang={l} aria-label={t("hud.lang")}>{l.toUpperCase()}</a>)}
      </div>
      <button className="hud-btn icon-only" type="button" aria-pressed={muted} aria-label={t("hud.sound")} title={muted ? t("hud.soundOff") : t("hud.soundOn")} onClick={() => { const m = !muted; setMuted(m); if (!m) play("boot"); }}>
        <ArtIcon name={muted ? "muted" : "sound"} size={24} />
      </button>
    </div>
  );
}

/** The direct view's top row: the name (back to the world), the CV pill and the settings cluster. */
export function TopBar({ locale, altPath, flat }: { locale: Locale; altPath: string; flat: boolean }) {
  const w = useW(locale);
  return (
    <header className="topbar" data-flat={flat}>
      <Link className="brand-mark" href={homePath(locale)} aria-label={`${person.shortName} · ${w("top.home")}`}>
        <BrandMark size={16} />
        <span className="brand-name">{person.shortName}</span>
      </Link>
      <div className="topbar-right">
        <a className="btn cta pill-cv" href={cvPath(locale)} download aria-label={w("top.cvLabel")}><ArtIcon name="cv" size={22} />{w("top.cv")}</a>
        <Settings locale={locale} altPath={altPath} />
      </div>
    </header>
  );
}
