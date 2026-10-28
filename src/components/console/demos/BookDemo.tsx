"use client";
import { useRef, useState } from "react";
import { questions, rankFor } from "@/data/trivia";
import { play } from "@/lib/sound";
import { useConsoleInput, useStep } from "../input";
import { HowTo, useHowTo } from "../HowTo";

type Phase = "ask" | "feedback" | "end";

// @step copy: All visible text lives in one table per language, so switching locale only swaps strings.
// @paso copy: Todo el texto visible está en una tabla por idioma, así que cambiar de idioma solo cambia cadenas.
const T = {
  en: { score: "Score", streak: "Streak", pick: "↑↓ choose · Enter / click: confirm", next: "Enter: next", right: "Right!", wrong: "Not quite.", again: "Enter: try again", rank: "Rank", of: "of" },
  es: { score: "Puntos", streak: "Racha", pick: "↑↓ elegir · Enter / clic: confirmar", next: "Enter: siguiente", right: "¡Correcto!", wrong: "Incorrecto.", again: "Enter: otra vez", rank: "Rango", of: "de" },
};

/** JavaScript trivia drawn from the book's topics. arrows choose, Enter or a click confirms. */
export function BookDemo({ locale }: { locale: "en" | "es" }) {
  const t = T[locale];
  const step = useStep();
  const how = useHowTo("book");
  const [n, setN] = useState(0);
  const [sel, setSel] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [ok, setOk] = useState(false);
  // @step live-ref: A ref mirrors the latest state so the input handler never reads stale values.
  // @paso live-ref: Una ref refleja el último estado para que el manejador de entrada nunca lea valores obsoletos.
  const live = useRef({ n, sel, phase, streak, score });
  live.current = { n, sel, phase, streak, score };

  // @step answer: Confirming compares the chosen option with the stored answer and updates score and streak.
  // @paso answer: Confirmar compara la opción elegida con la respuesta guardada y actualiza puntos y racha.
  const answer = (choice: number) => {
    const c = live.current;
    if (c.phase !== "ask") return;
    step("answer");
    const right = choice === questions[c.n].answer;
    setSel(choice);
    setOk(right);
    setPhase("feedback");
    if (right) {
      play("confirm");
      setScore(c.score + 1);
      setStreak(c.streak + 1);
      setBest(Math.max(best, c.streak + 1));
    } else {
      play("back");
      setStreak(0);
    }
  };

  useConsoleInput((a) => {
    if (how.openRef.current) { if (a === "a" || a === "b") how.hide(); return; }
    const c = live.current;
    if (c.phase === "ask") {
      if (a === "up" || a === "down") {
        play("blip");
        setSel((s) => (s + (a === "down" ? 1 : 2)) % 3);
      } else if (a === "a") {
        answer(c.sel);
      }
    // @step next: After the explanation, Enter moves to the next question or ends the quiz and shows the rank.
    // @paso next: Tras la explicación, Enter pasa a la siguiente pregunta o termina el quiz y muestra el rango.
    } else if (c.phase === "feedback" && a === "a") {
      if (c.n + 1 >= questions.length) {
        step("next");
        play("epic");
        setPhase("end");
      } else {
        step("render");
        play("flip");
        setN(c.n + 1);
        setSel(0);
        setPhase("ask");
      }
    } else if (c.phase === "end" && a === "a") {
      play("boot");
      setN(0); setSel(0); setScore(0); setStreak(0); setBest(0); setPhase("ask");
    }
  });

  if (phase === "end") {
    return (
      <div className="dm dm-book">
        <p className="bk-title">{t.rank}</p>
        <p className="bk-rank">{rankFor(score, questions.length, locale)}</p>
        <p className="dm-note" aria-live="polite">{score} {t.of} {questions.length} · {t.streak} {best}</p>
        <p className="dm-hint">{t.again}</p>
      </div>
    );
  }

  // @step render: Each question renders a real code snippet, three options and the explanation once answered.
  // @paso render: Cada pregunta muestra un fragmento de código real, tres opciones y la explicación al responder.
  const q = questions[n];
  return (
    <div className="dm dm-book">
      <div className="bk-bar">
        <span>{n + 1}/{questions.length}</span>
        <span>{t.score} {score}</span>
        <span className={streak > 1 ? "hot" : undefined}>{t.streak} {streak}</span>
      </div>
      <pre className="bk-code"><code>{q.code}</code></pre>
      <p className="bk-q">{q.q[locale]}</p>
      <ul className="bk-opts">
        {q.options.map((o, i) => {
          const state = phase === "feedback" ? (i === q.answer ? "right" : i === sel ? "wrong" : "") : "";
          return <li key={i} className={`${i === sel ? "sel" : ""} ${state}`.trim()}><button type="button" onClick={(e) => { e.currentTarget.blur(); answer(i); }} disabled={phase !== "ask"}><span aria-hidden="true">{i === sel ? "▸" : " "}</span> {o[locale]}</button></li>;
        })}
      </ul>
      <p className="dm-note bk-fb" aria-live="polite">{phase === "feedback" ? <><b>{ok ? t.right : t.wrong}</b> {q.why[locale]}</> : ""}</p>
      <p className="dm-hint">{phase === "ask" ? t.pick : t.next}</p>
      <HowTo id="book" locale={locale} how={how} />
    </div>
  );
}
