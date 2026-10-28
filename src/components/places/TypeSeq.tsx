"use client";
import { useEffect, useRef, type ReactNode } from "react";

let seen = false;

/** Progressive typewriter for a terminal window. The server renders the whole session (commands `.t-cmd > .t-typed` followed by their
 * output `.t-out`) as real text, so crawlers and no-JS visitors read everything. With JS and motion allowed, this wrapper blanks the first
 * `typed` commands, types them one by one and reveals each output line by line. A click, a tap or Enter finishes at once; later visits in
 * the same session and reduced motion show the finished session. */
export function TypeSeq({ typed = 3, children, hint }: { typed?: number; children: ReactNode; hint: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || seen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cmds = Array.from(el.querySelectorAll<HTMLElement>(".t-cmd:not(.t-final)"));
    const outs = cmds.map((c) => c.nextElementSibling as HTMLElement | null);
    const texts = cmds.map((c) => c.querySelector<HTMLElement>(".t-typed")!.textContent ?? "");
    let dead = false, timer = 0, i = 0;
    const top = () => el.closest<HTMLElement>(".win-body")?.scrollTo({ top: 0, behavior: "smooth" });
    const typedEls = cmds.map((c) => c.querySelector<HTMLElement>(".t-typed")!);
    const pace = (ms: number) => new Promise<void>((r) => { timer = window.setTimeout(r, ms); });
    const reveal = (o: HTMLElement | null, animate: boolean) => {
      if (!o) return;
      Array.from(o.children).forEach((c, n) => (c as HTMLElement).style.setProperty("--n", String(animate ? Math.min(n, 16) : 0)));
      o.classList.remove("is-pending");
      o.classList.toggle("is-live", animate);
    };
    const finish = () => {
      dead = true; window.clearTimeout(timer);
      typedEls.forEach((t, n) => { t.textContent = texts[n]; cmds[n].classList.remove("is-typing"); cmds[n].classList.remove("is-pending"); });
      outs.forEach((o) => reveal(o, false));
      seen = true;
      el.dataset.typing = "done";
      top();
    };
    cmds.forEach((c, n) => { c.classList.add("is-pending"); outs[n]?.classList.add("is-pending"); typedEls[n].textContent = ""; });
    el.dataset.typing = "on";
    const run = async () => {
      for (i = 0; i < cmds.length && !dead; i++) {
        const c = cmds[i];
        c.classList.remove("is-pending"); c.classList.add("is-typing");
        if (i < typed) {
          for (let k = 1; k <= texts[i].length && !dead; k++) { typedEls[i].textContent = texts[i].slice(0, k); await pace(26 + (k % 3) * 9); }
        } else typedEls[i].textContent = texts[i];
        if (dead) return;
        await pace(i < typed ? 190 : 60);
        c.classList.remove("is-typing");
        reveal(outs[i], true);
        c.scrollIntoView({ block: "nearest" });
        await pace(i < typed ? 420 : 140);
        outs[i]?.lastElementChild?.scrollIntoView({ block: "nearest" });
      }
      if (!dead) { seen = true; el.dataset.typing = "done"; await pace(500); if (!dead) top(); }
    };
    run();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" && !(e.target instanceof HTMLElement && e.target.closest("a, button"))) finish(); };
    el.addEventListener("pointerdown", finish);
    window.addEventListener("keydown", onKey);
    return () => { dead = true; window.clearTimeout(timer); el.removeEventListener("pointerdown", finish); window.removeEventListener("keydown", onKey); typedEls.forEach((t, n) => { t.textContent = texts[n]; }); cmds.forEach((c, n) => { c.classList.remove("is-pending", "is-typing"); outs[n]?.classList.remove("is-pending", "is-live"); }); delete el.dataset.typing; };
  }, [typed]);
  return (
    <div className="term" ref={root}>
      {children}
      <p className="t-skip mono" aria-hidden="true">{hint}</p>
    </div>
  );
}

export function Cmd({ children, user = "david", dir = "~", final }: { children?: ReactNode; user?: string; dir?: string; final?: boolean }) {
  return (
    <p className={`t-cmd${final ? " t-final" : ""}`}>
      <span className="t-ps" aria-hidden="true"><span className="t-user">{user}@manizales</span><span className="t-dir">{dir}</span><span className="t-sym">❯</span></span>
      <span className="t-typed">{children}</span>
    </p>
  );
}
