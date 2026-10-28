// About David: story, availability, learning and interests. Every line must be verifiable.
import type { Locale } from "./projects";

type L = Record<Locale, string>;

export type StoryChapter = { id: string; period: string; title: L; body: L };
export type Note = { id: string; title: L; body: L };
export type Interest = { id: string; label: L };

export const availability: { modes: L[]; line: L } = {
  modes: [
    { en: "Remote", es: "Remoto" },
    { en: "Hybrid", es: "Híbrido" },
    { en: "On-site", es: "Presencial" },
  ],
  line: { en: "Open to remote, hybrid and on-site work", es: "Disponible para trabajo remoto, híbrido y presencial" },
};

/** Storytelling chapters for the About place, oldest first. Emotion first, then proof. */
export const story: StoryChapter[] = [
  {
    id: "marketing",
    period: "2020 – 2024",
    title: { en: "Where it started", es: "Dónde empecé" },
    body: {
      en: "I started in digital marketing: for a while I worked on campaigns as a freelancer. But what I enjoy is development. Technology, software and learning are what drive me.",
      es: "Empecé en el marketing digital: durante un tiempo trabajé en campañas como freelance. Pero lo que disfruto es el desarrollo. La tecnología, el software y aprender son lo que me mueve.",
    },
  },
  {
    id: "university",
    period: "2023 – 2025",
    title: { en: "Learning the craft", es: "Aprender el oficio" },
    body: {
      en: "Then I moved to what I enjoy most: building software. I studied Information Systems at Universidad de Caldas in Manizales, and I never stopped learning on my own: Python, Java, JavaScript, databases and web back ends.",
      es: "Después pasé a lo que más disfruto: construir software. Estudié Sistemas de Información en la Universidad de Caldas, en Manizales, y nunca dejé de aprender por mi cuenta: Python, Java, JavaScript, bases de datos y back ends web.",
    },
  },
  {
    id: "freelance",
    period: "2025 →",
    title: { en: "Shipping end to end", es: "Entregar de punta a punta" },
    body: {
      en: "As a freelance full-stack developer I carry a project alone, from the first client call to production. React, Next.js, Node.js, PostgreSQL. One of my solo builds is TCG Store: 31 Prisma models, a deck builder and an admin panel.",
      es: "Como desarrollador full-stack freelance llevo un proyecto yo solo, desde la primera llamada con el cliente hasta producción. React, Next.js, Node.js, PostgreSQL. Uno de mis proyectos en solitario es TCG Store: 31 modelos de Prisma, un constructor de mazos y un panel de administración.",
    },
  },
  {
    id: "amplixme",
    period: "07 – 08 · 2026",
    title: { en: "Building with a team", es: "Construir en equipo" },
    body: {
      en: "Then I learned how a team ships. In the AmplixMe acceleration program, a training program, seven of us built a blog with comments in Node.js and React. I merged 16 pull requests: login with JWT, image upload, CRUD pages, search, sorting and a seed script.",
      es: "Después aprendí cómo entrega un equipo. En el programa de aceleración de AmplixMe, un programa de formación, siete personas construimos un blog con comentarios en Node.js y React. Integré 16 pull requests: login con JWT, subida de imágenes, páginas CRUD, búsqueda, orden y un script de seed.",
    },
  },
  {
    id: "community",
    period: "2026",
    title: { en: "Open source and community", es: "Open source y comunidad" },
    body: {
      en: "I like building where others can see it. I go to the AWS User Group Manizales meetups, I had two pull requests merged into its Skorify project, and I maintain omarchy-zen, a Zen browser theme sync that is verified in the Omarchy plugin marketplace and has merged contributions from other people. I also built IKAI Shell, an open source desktop shell for Omarchy.",
      es: "Me gusta construir donde otros pueden verlo. Voy a los encuentros del AWS User Group Manizales, tengo dos pull requests integrados en su proyecto Skorify y mantengo omarchy-zen, una sincronización de temas para el navegador Zen verificada en el marketplace de plugins de Omarchy y con contribuciones integradas de otras personas. También construí IKAI Shell, un shell de escritorio open source para Omarchy.",
    },
  },
  {
    id: "learning-now",
    period: "2026 →",
    title: { en: "Still learning, on purpose", es: "Aprendiendo, a propósito" },
    body: {
      en: "I never feel finished, and I like it that way. What I learn, I write down and share, like my free JavaScript learning site.",
      es: "Nunca me siento terminado y así me gusta. Lo que aprendo, lo escribo y lo comparto, como mi sitio gratuito de aprendizaje de JavaScript.",
    },
  },
];

/** What a team gets (short value notes). */
export const values: Note[] = [
  {
    id: "end-to-end",
    title: { en: "I ship end to end", es: "Entrego de punta a punta" },
    body: {
      en: "From the first call to a working deployment. Data model, API, interface, tests and docs.",
      es: "Desde la primera llamada hasta un despliegue que funciona. Modelo de datos, API, interfaz, pruebas y documentación.",
    },
  },
  {
    id: "team",
    title: { en: "I work the way your team works", es: "Trabajo como trabaja tu equipo" },
    body: {
      en: "Tickets, branches and pull requests. Small changes that are easy to review, in a team of seven and in other people's projects.",
      es: "Tickets, ramas y pull requests. Cambios pequeños y fáciles de revisar, en un equipo de siete y en proyectos de otras personas.",
    },
  },
  {
    id: "quality",
    title: { en: "I keep quality habits", es: "Cuido la calidad" },
    body: {
      en: "Unit and end-to-end tests with Vitest and Playwright, CI checks, accessible contrast, and trade-offs written down in the README.",
      es: "Pruebas unitarias y de extremo a extremo con Vitest y Playwright, chequeos en CI, contraste accesible y las decisiones y sus costos escritos en el README.",
    },
  },
  {
    id: "explain",
    title: { en: "I explain what I build", es: "Explico lo que construyo" },
    body: {
      en: "Working with clients taught me to translate between people and code, and to write docs a stranger can follow.",
      es: "Trabajar con clientes me enseñó a traducir entre personas y código, y a escribir documentación que un desconocido pueda seguir.",
    },
  },
  {
    id: "curiosity",
    title: { en: "I stay curious and share what I learn", es: "Sigo con curiosidad y comparto lo que aprendo" },
    body: {
      en: "I turned my JavaScript study notes into a free learning site, and I go to community meetups to learn from others.",
      es: "Convertí mis notas de estudio de JavaScript en un sitio de aprendizaje gratuito, y voy a encuentros de la comunidad para aprender de otras personas.",
    },
  },
];

/** Constant learning, kept general on purpose: the specific items live in the stack's learning group (site.ts). */
export const learning: Note[] = [
  {
    id: "always-learning",
    title: { en: "Always learning", es: "Siempre aprendiendo" },
    body: {
      en: "I like to keep learning: every project teaches me something new, and I enjoy turning what I learn into something other people can use.",
      es: "Me gusta seguir aprendiendo: cada proyecto me enseña algo nuevo y disfruto convertir lo que aprendo en algo que otras personas puedan usar.",
    },
  },
];

export const interests: Interest[] = [
  { id: "reading", label: { en: "Reading", es: "Lectura" } },
  { id: "games", label: { en: "PC video games", es: "Videojuegos en PC" } },
  { id: "tech", label: { en: "Technology", es: "Tecnología" } },
  { id: "sport", label: { en: "Sport", es: "Deporte" } },
  { id: "art", label: { en: "Art and design", es: "Arte y diseño" } },
  { id: "coffee", label: { en: "Coffee", es: "Café" } },
  { id: "music", label: { en: "Music", es: "Música" } },
];

/** Why the illustrations look the way they do: an invitation into David's world, then a soft bridge to how he works. */
export const artNote: { title: L; body: L; items: { id: string; label: L }[] } = {
  title: { en: "Why these pictures?", es: "¿Por qué estas imágenes?" },
  body: {
    en: "Every scene in this portfolio is made of things I like: Manizales, my city, with its cathedral, its sunsets and the Nevado del Ruiz volcano on the horizon; the cable car; a good coffee; books; PC games; plants; and music. The illustrations are AI-generated and directed by me, but what they show is my life. If something here made you curious about me, that is exactly the point. The same care for small details is how I build software.",
    es: "Cada escena de este portafolio está hecha de cosas que me gustan: Manizales, mi ciudad, con su catedral, sus atardeceres y el volcán Nevado del Ruiz en el horizonte; el cable aéreo; un buen café; los libros; los juegos de PC; las plantas; y la música. Las ilustraciones están generadas con IA y dirigidas por mí, pero lo que muestran es mi vida. Si algo de aquí te dio curiosidad por conocerme, ese es justo el propósito. El mismo cuidado por los detalles pequeños es como construyo software.",
  },
  items: [
    { id: "cathedral", label: { en: "The cathedral of Manizales", es: "La catedral de Manizales" } },
    { id: "sunsets", label: { en: "Manizales sunsets", es: "Atardeceres de Manizales" } },
    { id: "volcano", label: { en: "Nevado del Ruiz on the horizon", es: "El Nevado del Ruiz en el horizonte" } },
    { id: "cable-car", label: { en: "The cable car", es: "El cable aéreo" } },
    { id: "coffee", label: { en: "Coffee", es: "Café" } },
    { id: "books", label: { en: "Books", es: "Libros" } },
    { id: "games", label: { en: "PC games", es: "Juegos de PC" } },
    { id: "plants", label: { en: "Plants", es: "Plantas" } },
    { id: "music", label: { en: "Music", es: "Música" } },
  ],
};
