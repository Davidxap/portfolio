// Verified facts only. Each number carries its source and date.
export const person = {
  name: "David Arroyave Pérez",
  shortName: "David Arroyave",
  /** Full name as written on the CV, so name searches and ATS matching connect both. */
  legalName: "David Arturo Arroyave Pérez",
  jobTitle: "Full-Stack Developer",
  city: "Manizales",
  region: "Caldas",
  country: "CO",
  email: "davidxap@gmail.com",
  github: "https://github.com/Davidxap",
  githubUser: "Davidxap",
  linkedin: "https://www.linkedin.com/in/davidxaperez",
  languages: ["es", "en"],
  knowsAbout: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "FastAPI", "PostgreSQL", "Supabase", "Linux"],
} as const;

export const stack = {
  frontend: ["TypeScript", "JavaScript (ES6+)", "React", "Next.js", "Astro", "Tailwind CSS", "HTML5", "CSS3"],
  backend: ["Node.js", "Express", "Python", "FastAPI", "Django", "Go", "REST APIs", "JWT auth"],
  data: ["PostgreSQL", "Prisma", "Supabase", "MongoDB (working knowledge)"],
  testing: ["Vitest", "Playwright", "Code review", "WCAG accessibility"],
  tools: ["Git / GitHub", "GitHub Actions", "Linux", "Bash", "Vercel", "Docker (local dev)", "Cloudinary"],
  ai: ["Claude Code", "OpenCode", "AI agent workflows"],
} as const;

/** What David is learning now, shown as the last stack group. Chips carry both languages; AWS is only ever "certification pending". */
export const stackLearning: Record<"en" | "es", string>[] = [
  { en: "AWS (certification pending)", es: "AWS (certificación pendiente)" },
  { en: "Product engineering with AI", es: "Product engineering con IA" },
];
