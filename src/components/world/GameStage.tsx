"use client";
import { useEffect, useState, type ComponentType } from "react";
import { gameById } from "@/data/games";
import type { Locale } from "@/data/projects";
import type { Step } from "@/lib/walkthrough";
import { CodePanel } from "../console/CodePanel";
import { StepBus } from "../console/input";

type Labels = { loading: string; code: string; note: string; noscript: string; back: string };

/** Runs one arcade demo inside the console screen. The demo module loads lazily, so no game code ships with the other pages.
 * Input (keyboard, pad, d-pad, A/B) arrives through the InputBus the WorldShell provides. */
export function GameStage({ id, locale, code, steps, labels, title }: { id: string; locale: Locale; code: string; steps: Step[]; labels: Labels; title: string }) {
  const [Demo, setDemo] = useState<ComponentType<{ locale: Locale }> | null>(null);
  const [step, setStep] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setDemo(null); setStep(null);
    gameById(id)?.load().then((m) => { if (live) setDemo(() => m.default); });
    return () => { live = false; };
  }, [id]);

  return (
    <div className="cs game-stage" data-game={id}>
      <div className="cs-screen" data-cart={id} role="group" aria-label={title}>
        <div className="cs-view">
          {Demo ? <StepBus.Provider value={setStep}><Demo locale={locale} /></StepBus.Provider> : <p className="dm-note game-loading" role="status">{labels.loading}</p>}
        </div>
      </div>
      <noscript><p className="dm-note">{labels.noscript}</p></noscript>
      <p className="cs-hint mono tiny">{labels.back}</p>
      <CodePanel code={code} steps={steps} active={step} onSelect={setStep} locale={locale} caption={`${labels.code}: ${title}`} note={labels.note} />
    </div>
  );
}
