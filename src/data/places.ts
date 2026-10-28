// The world map's places. Order = map order and d-pad order. Adding a place = one entry here plus one page per locale.
import type { Locale } from "./projects";
import type { ArtIconName } from "@/components/world/icons";

export type PlaceId = "about" | "projects" | "experience" | "stack" | "arcade" | "contact";
type L = Record<Locale, string>;

export type Place = {
  id: PlaceId;
  icon: ArtIconName;
  path: L;
  label: L;
  /** One line shown in the hover/focus card on the map. */
  teaser: L;
  /** Meta description of the place page. */
  description: L;
  /** Hotspot anchor in % of the wallpaper (public/art/v3/map-2027-*, 1672x940), measured on the real image: each hotspot sits on the painted object its place is named after. */
  pin: { x: number; y: number };
  /** Where the label sits relative to the hotspot; defaults to below. */
  at?: "top" | "bottom" | "left" | "right";
};

export const places: Place[] = [
  {
    id: "about", icon: "about",
    path: { en: "/about/", es: "/es/sobre-mi/" },
    label: { en: "About", es: "Sobre mí" },
    teaser: { en: "The developer at the desk: how I work and why teams enjoy it.", es: "El desarrollador en su escritorio: cómo trabajo y por qué se disfruta en equipo." },
    description: {
      en: "About David Arroyave Pérez: a full-stack developer from Manizales, Colombia, who listens to clients, owns the result and documents what he ships.",
      es: "Sobre David Arroyave Pérez: desarrollador full-stack de Manizales, Colombia, que escucha al cliente, se hace responsable del resultado y documenta lo que entrega.",
    },
    pin: { x: 88.5, y: 45.7 }, at: "left",
  },
  {
    id: "projects", icon: "projects",
    path: { en: "/projects/", es: "/es/proyectos/" },
    label: { en: "Projects", es: "Proyectos" },
    teaser: { en: "Real work on the monitors: what each project is and what I built.", es: "Trabajo real en los monitores: qué es cada proyecto y qué construí." },
    description: {
      en: "Projects by David Arroyave Pérez: TCG Store, IKAI Shell, omarchy-zen and a JavaScript learning site in Spanish and English, with links to the evidence.",
      es: "Proyectos de David Arroyave Pérez: TCG Store, IKAI Shell, omarchy-zen y un sitio para aprender JavaScript en español e inglés, con enlaces a la evidencia.",
    },
    pin: { x: 50.8, y: 62.8 }, at: "top",
  },
  {
    id: "experience", icon: "experience",
    path: { en: "/experience/", es: "/es/experiencia/" },
    label: { en: "Experience", es: "Experiencia" },
    teaser: { en: "The cable car ride: from client work to full-stack development.", es: "El viaje en cable: del trabajo con clientes al desarrollo full-stack." },
    description: {
      en: "Experience of David Arroyave Pérez: freelance digital marketing campaigns, a degree in Information Systems and freelance full-stack development.",
      es: "Experiencia de David Arroyave Pérez: campañas de marketing digital freelance, una tecnología en Sistemas de Información y desarrollo full-stack freelance.",
    },
    pin: { x: 39.2, y: 31.4 }, at: "bottom",
  },
  {
    id: "stack", icon: "stack",
    path: { en: "/stack/", es: "/es/stack/" },
    label: { en: "Stack", es: "Stack" },
    teaser: { en: "The bookshelf: the languages, frameworks and tools I work with.", es: "La biblioteca: los lenguajes, frameworks y herramientas con los que trabajo." },
    description: {
      en: "Technology stack of David Arroyave Pérez: TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Supabase, Docker and more.",
      es: "Stack tecnológico de David Arroyave Pérez: TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Supabase, Docker y más.",
    },
    pin: { x: 91.8, y: 21.3 }, at: "bottom",
  },
  {
    id: "arcade", icon: "arcade",
    path: { en: "/arcade/", es: "/es/arcade/" },
    label: { en: "Arcade", es: "Arcade" },
    teaser: { en: "The controller on the desk: minigames and interactive demos of my projects.", es: "El control sobre el escritorio: minijuegos y demos interactivas de mis proyectos." },
    description: {
      en: "Arcade: minigames and interactive demos inspired by David Arroyave's projects, each with a clear goal.",
      es: "Arcade: minijuegos y demos interactivas inspiradas en los proyectos de David Arroyave, cada una con un objetivo claro.",
    },
    pin: { x: 55.3, y: 80.6 }, at: "bottom",
  },
  {
    id: "contact", icon: "contact",
    path: { en: "/contact/", es: "/es/contacto/" },
    label: { en: "Contact", es: "Contacto" },
    teaser: { en: "Let's have a coffee: email, GitHub, LinkedIn and the CV.", es: "Tomemos un café: correo, GitHub, LinkedIn y el CV." },
    description: {
      en: "Contact David Arroyave Pérez: open to full-stack and frontend roles, remote, hybrid or on-site. Email, GitHub, LinkedIn and CV.",
      es: "Contacta a David Arroyave Pérez: abierto a roles full-stack y frontend, remotos, híbridos o presenciales. Correo, GitHub, LinkedIn y CV.",
    },
    pin: { x: 48.7, y: 78.2 }, at: "left",
  },
];

export const placeById = (id: PlaceId): Place => places.find((p) => p.id === id)!;
export const placeIndex = (id: PlaceId) => places.findIndex((p) => p.id === id);
export const nextPlace = (id: PlaceId): Place => places[(placeIndex(id) + 1) % places.length];
export const prevPlace = (id: PlaceId): Place => places[(placeIndex(id) - 1 + places.length) % places.length];
