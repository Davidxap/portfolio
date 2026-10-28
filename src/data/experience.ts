// Work and study entries for the Experience place and the Direct view. Facts only: cv-src/CV_General_*.html and
import type { Locale } from "./projects";

type L = Record<Locale, string>;

export type ExperienceEntry = {
  id: "freelance" | "marketing" | "education";
  period: L;
  title: L;
  where: L;
  summary: L;
  bullets: L[];
  stack: string[];
  /** Why it matters, one line. */
  matters?: L;
  related?: { label: L; slugs: string[] };
};

/** Newest first. */
export const experience: ExperienceEntry[] = [
  {
    id: "freelance",
    period: { en: "2025 — now", es: "2025 — hoy" },
    title: { en: "Freelance full-stack developer", es: "Desarrollador full-stack freelance" },
    where: { en: "Remote", es: "Remoto" },
    summary: {
      en: "I take web projects for clients from the first conversation to a live, documented product.",
      es: "Llevo proyectos web para clientes desde la primera conversación hasta un producto en línea y documentado.",
    },
    bullets: [
      { en: "From requirements to production: scope, data model, API, interface and deployment.", es: "De los requisitos a producción: alcance, modelo de datos, API, interfaz y despliegue." },
      { en: "APIs and data: REST APIs with FastAPI and Next.js, PostgreSQL and Supabase databases.", es: "APIs y datos: APIs REST con FastAPI y Next.js, bases de datos PostgreSQL y Supabase." },
      { en: "Delivery: deployments on Vercel and the technical documentation that ships with each project.", es: "Entrega: despliegues en Vercel y la documentación técnica que acompaña cada proyecto." },
      { en: "Automation: Python and Bash scripts for reporting, backups and data collection.", es: "Automatización: scripts en Python y Bash para reportes, copias de seguridad y recolección de datos." },
      { en: "Communication: I report progress directly to the client.", es: "Comunicación: informo el avance directamente al cliente." },
    ],
    stack: ["Next.js", "React", "TypeScript", "FastAPI", "Python", "PostgreSQL", "Supabase", "Vercel", "Bash"],
    related: { label: { en: "Own projects", es: "Proyectos propios" }, slugs: ["tcg-store", "ikai", "omarchy-zen"] },
  },
  {
    id: "marketing",
    period: { en: "2020 — 2024", es: "2020 — 2024" },
    title: { en: "Freelance digital marketing campaigns", es: "Campañas de marketing digital (freelance)" },
    where: { en: "Freelance", es: "Freelance" },
    summary: { en: "For a while I worked on digital marketing campaigns as a freelancer.", es: "Durante un tiempo trabajé en campañas de marketing digital como freelance." },
    bullets: [
      { en: "Strategy and content planning.", es: "Estrategia y planificación de contenido." },
      { en: "Platform management.", es: "Gestión de plataformas." },
      { en: "Metrics reporting to the client.", es: "Reportes de métricas para el cliente." },
    ],
    stack: [],
    matters: { en: "What I enjoy most is development, technology and software.", es: "Lo que más disfruto es el desarrollo, la tecnología y el software." },
  },
  {
    id: "education",
    period: { en: "2023 — 2025", es: "2023 — 2025" },
    title: { en: "Information Systems Technologist", es: "Tecnólogo en Sistemas de Información" },
    where: { en: "Universidad de Caldas", es: "Universidad de Caldas" },
    summary: { en: "Manizales, Colombia.", es: "Manizales, Colombia." },
    bullets: [],
    stack: [],
  },
];
