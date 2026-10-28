// Arcade framing: what the arcade is, and what it is not.
import type { Locale } from "./projects";

type L = Record<Locale, string>;

export const arcadeIntro: { title: L; body: L } = {
  title: { en: "A small side project of mine", es: "Un pequeño proyecto aparte" },
  body: {
    en: "The arcade is a small side project where some of my projects become tiny playable toys. Each game is inspired by one of them, but it is not the project itself, and the game may have little to do with what the project actually does. It is built with React and TypeScript, and it is here because I wanted to give the page some interactivity that reflects my style and my tastes.",
    es: "El arcade es un pequeño proyecto aparte donde algunos de mis proyectos se convierten en juguetes diminutos que se pueden jugar. Cada juego está inspirado en uno de ellos, pero no es el proyecto en sí, y puede que el juego tenga poco que ver con lo que el proyecto realmente hace. Está construido con React y TypeScript, y está aquí porque quise darle a la página algo de interactividad que refleje mi estilo y mis gustos.",
  },
};
