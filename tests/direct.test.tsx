import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ModeSwitch } from "@/components/world/ModeSwitch";
import { WorldIntro } from "@/components/world/WorldIntro";
import { DirectView } from "@/components/places/DirectView";
import { places } from "@/data/places";
import { projects } from "@/data/projects";
import { person, stack, stackLearning } from "@/data/site";
import { useT } from "@/i18n/ui";
import { useW, type WKey } from "@/i18n/world";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

describe("mode switch", () => {
  it("marks the active mode with aria-current and links to the other one, in both locales", () => {
    const { unmount } = render(<ModeSwitch locale="en" mode="interactive" />);
    const nav = screen.getByRole("navigation", { name: "View mode" });
    expect(within(nav).getByText("Interactive").closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: /Direct/ })).toHaveAttribute("href", "/direct/");
    unmount();
    render(<ModeSwitch locale="es" mode="direct" />);
    const es = screen.getByRole("navigation", { name: "Modo de vista" });
    expect(within(es).getByText("Directo").closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    expect(within(es).getByRole("link", { name: /Interactivo/ })).toHaveAttribute("href", "/es/");
  });

  it("is on the world map identity block and no longer says 'Recruiter in a hurry'", () => {
    render(<WorldIntro locale="en" />);
    expect(screen.getByRole("navigation", { name: "View mode" })).toBeInTheDocument();
    expect(screen.queryByText(/hurry/i)).toBeNull();
  });
});

describe("direct view", () => {
  beforeEach(() => { document.body.innerHTML = ""; vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null); });
  it("starts with the switch back to interactive mode and ends with a contact band holding CV, email, GitHub and LinkedIn", async () => {
    render(await DirectView({ locale: "en" }));
    expect(screen.getByRole("navigation", { name: "View mode" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "View mode" })).getByRole("link", { name: /Interactive/ })).toHaveAttribute("href", "/");
    const contact = document.getElementById("d-contact")!;
    expect(contact).not.toBeNull();
    expect(within(contact).getByRole("link", { name: /CV/ })).toHaveAttribute("download");
    expect(contact.querySelector('a[href^="mailto:"]')).not.toBeNull();
    expect(within(contact).getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(within(contact).getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it("shows every stack group (six) and the Spanish page links back to /es/", async () => {
    render(await DirectView({ locale: "es" }));
    expect(Object.keys(stack)).toHaveLength(6);
    for (const k of Object.keys(stack)) expect(document.getElementById(`d-stack-${k}`)).not.toBeNull();
    expect(within(screen.getByRole("navigation", { name: "Modo de vista" })).getByRole("link", { name: /Interactivo/ })).toHaveAttribute("href", "/es/");
  });

  it("opens with the painted opening: the paint field, the identity widget text of the interactive home as the only H1, the field card and the projects", async () => {
    render(await DirectView({ locale: "en" }));
    expect(document.querySelector(".d-paint .paintfield")).not.toBeNull();
    expect(document.querySelector(".d-eyebrow")).toHaveTextContent("Manizales · 2,150 m");
    expect(document.body.textContent).not.toMatch(/PLAYER ONE|Featured projects|Proyectos destacados/);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("David Arroyave Pérez");
    expect(document.querySelector(".d-lead")).toHaveTextContent(useT("en")("map.value"));
    expect(document.querySelector(".d-name")).toHaveTextContent(person.jobTitle);
    expect(document.querySelector(".d-card dl")).not.toBeNull();
    expect(document.querySelectorAll("#d-projects .d-featured li").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".d-card .pdavid")).toHaveLength(1);
  });

  it("shows a CV-style card without repo or star stats and without AWS", async () => {
    render(await DirectView({ locale: "en" }));
    const card = document.querySelector(".d-card")!;
    expect(card.querySelector(".d-mini")).toBeNull();
    expect(card).toHaveTextContent("At a glance");
    expect(card.textContent).not.toMatch(/repos|stars|estrellas|AWS/i);
    expect(card.querySelectorAll("dl > div")).toHaveLength(7);
    expect(card).toHaveTextContent("TypeScript · React · Next.js · Node.js · PostgreSQL");
  });

  it("keeps AWS out of the story and puts it only as the 'certification pending' stack chip, in both languages", async () => {
    render(await DirectView({ locale: "en" }));
    expect(document.getElementById("d-about")!.textContent).not.toMatch(/AWS(?! User Group)/);
    expect(document.getElementById("d-stack-learning")).toHaveTextContent("AWS (certification pending)");
    expect(document.getElementById("d-stack-learning")).toHaveTextContent("Product engineering with AI");
    expect(document.querySelectorAll("#d-stack-learning .chip")).toHaveLength(stackLearning.length);
    expect(document.querySelector(".d-notes")).toBeNull();
    expect(document.querySelectorAll("#d-experience .d-bullets li").length).toBeGreaterThanOrEqual(5);
    expect(document.getElementById("d-experience")).toHaveTextContent("Communication: I report progress directly to the client.");
    document.body.innerHTML = "";
    render(await DirectView({ locale: "es" }));
    expect(document.getElementById("d-about")!.textContent).not.toMatch(/AWS(?! User Group)/);
    expect(document.getElementById("d-stack-learning")).toHaveTextContent("certificación pendiente");
    expect(document.getElementById("d-stack-learning")).toHaveTextContent("Product engineering con IA");
    expect(document.getElementById("d-experience")).toHaveTextContent("Comunicación: informo el avance directamente al cliente.");
    expect(document.querySelector(".d-card")).toHaveTextContent("En resumen");
  });

  it("resets the margin and wrapping of .btn.cta so the CV pill aligns (root cause: .cta in base.css)", () => {
    const css = readFileSync(`${process.cwd()}/src/styles/world.css`, "utf8");
    const rule = css.split("\n").find((l) => l.startsWith(".btn.cta {"))!;
    expect(rule).toMatch(/margin:\s*0/);
    expect(rule).toMatch(/flex-wrap:\s*nowrap/);
  });

  it("has no fixed-height wrappers that could clip: the opening and sections never set a height inline", async () => {
    render(await DirectView({ locale: "en" }));
    for (const el of document.querySelectorAll<HTMLElement>(".d-opening, .d-sec, .d-contact")) expect(el.style.height).toBe("");
  });

  it.each(["en", "es"] as const)("uses the interactive wording in %s: each place's panel heading and label, in the places order, nothing direct-only", async (locale) => {
    render(await DirectView({ locale }));
    const w = useW(locale);
    const secs = [...document.querySelectorAll<HTMLElement>("section[id^='d-'][aria-labelledby$='-h']")].filter((e) => places.some((p) => e.id === `d-${p.id}`));
    expect(secs.map((e) => e.id)).toEqual(places.map((p) => `d-${p.id}`));
    for (const p of places) {
      const sec = document.getElementById(`d-${p.id}`)!;
      expect(sec.querySelector("h2")).toHaveTextContent(w(`head.${p.id}` as WKey));
      expect(sec).toHaveTextContent(p.label[locale]);
    }
    const jump = [...document.querySelectorAll(".d-jump a")].map((a) => a.textContent);
    expect(jump).toEqual(places.map((p) => p.label[locale]));
    expect(document.body.textContent).not.toMatch(/PLAYER ONE|JUGADOR UNO|Featured projects|Proyectos destacados|Story\b|Historia\b/);
    for (const pr of projects) expect(document.body.textContent).toContain(pr.name);
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });
});
