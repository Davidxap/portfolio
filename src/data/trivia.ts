// JavaScript trivia drawn from topics of the book "JavaScript para subir de nivel".
// Every answer is real JavaScript behaviour (checked in Node).
import type { Locale } from "./projects";

type L10n = Record<Locale, string>;
export type Question = {
  code: string; // tiny snippet, same in both languages
  q: L10n;
  options: [L10n, L10n, L10n];
  answer: 0 | 1 | 2;
  why: L10n;
};

const o = (en: string, es = en): L10n => ({ en, es });

export const questions: Question[] = [
  { code: "typeof null", q: o("What does it evaluate to?", "¿A qué se evalúa?"),
    options: [o("'null'"), o("'object'"), o("'undefined'")], answer: 1,
    why: o("A historic quirk of the language: typeof null is 'object'.", "Una rareza histórica del lenguaje: typeof null es 'object'.") },
  { code: "[1, 2, 3].map(parseInt)", q: o("What is the result?", "¿Cuál es el resultado?"),
    options: [o("[1, 2, 3]"), o("[1, NaN, NaN]"), o("[0, 1, 2]")], answer: 1,
    why: o("map passes (value, index), so parseInt gets the index as radix: radix 1 is invalid, and 3 is not a digit in base 2.", "map pasa (valor, índice), así que parseInt recibe el índice como base: la base 1 no es válida y el 3 no es un dígito en base 2.") },
  { code: "[10, 9, 1].sort()", q: o("What does sort() return?", "¿Qué devuelve sort()?"),
    options: [o("[1, 9, 10]"), o("[10, 9, 1]"), o("[1, 10, 9]")], answer: 2,
    why: o("Without a comparator, sort compares elements as strings: '1' < '10' < '9'.", "Sin comparador, sort compara como texto: '1' < '10' < '9'.") },
  { code: "console.log(x);\nlet x = 1;", q: o("What happens?", "¿Qué pasa?"),
    options: [o("prints undefined", "imprime undefined"), o("ReferenceError"), o("prints 1", "imprime 1")], answer: 1,
    why: o("let lives in the temporal dead zone until its declaration runs.", "let vive en la zona muerta temporal hasta que corre su declaración.") },
  { code: "Promise.all([\n  Promise.resolve(1),\n  Promise.reject('x'),\n])", q: o("How does it settle?", "¿Cómo se resuelve?"),
    options: [o("fulfills with [1]", "se resuelve con [1]"), o("rejects with 'x'", "rechaza con 'x'"), o("fulfills with [1, 'x']", "se resuelve con [1, 'x']")], answer: 1,
    why: o("Promise.all fails fast: the first rejection rejects the whole thing.", "Promise.all falla rápido: el primer rechazo rechaza todo.") },
  { code: "0 ?? 'd'", q: o("What does it evaluate to?", "¿A qué se evalúa?"),
    options: [o("'d'"), o("0"), o("undefined")], answer: 1,
    why: o("?? only falls back on null or undefined, and 0 is neither (|| would give 'd').", "?? solo usa el valor de respaldo con null o undefined, y 0 no lo es (|| daría 'd').") },
  { code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');", q: o("Print order?", "¿Orden de impresión?"),
    options: [o("A B C D"), o("A D B C"), o("A D C B")], answer: 2,
    why: o("Sync first (A D), then microtasks (C), and only then the timer task (B).", "Primero lo síncrono (A D), luego las microtareas (C) y al final la tarea del timer (B).") },
  { code: "for (var i = 0; i < 3; i++)\n  setTimeout(() => console.log(i));", q: o("What does it print?", "¿Qué imprime?"),
    options: [o("0 1 2"), o("3 3 3"), o("0 0 0")], answer: 1,
    why: o("var has one shared i, which is already 3 when the timers fire. let would give 0 1 2.", "var tiene una sola i compartida, que ya vale 3 cuando disparan los timers. Con let sería 0 1 2.") },
  { code: "'5' - 3", q: o("What does it evaluate to?", "¿A qué se evalúa?"),
    options: [o("2"), o("'53'"), o("NaN")], answer: 0,
    why: o("- forces numbers, so '5' becomes 5. With + you would get '53'.", "- fuerza números, así que '5' pasa a 5. Con + saldría '53'.") },
  { code: "const a = [1, 2, 3];\na.length = 1;", q: o("What is a now?", "¿Cómo queda a?"),
    options: [o("[1, 2, 3]"), o("[1]"), o("error: length is read-only", "error: length es de solo lectura")], answer: 1,
    why: o("Setting a smaller length truncates the array.", "Asignar un length menor trunca el arreglo.") },
];

export const RANKS: { min: number; name: L10n }[] = [
  { min: 0, name: o("Apprentice", "Aprendiz") },
  { min: 0.4, name: o("Journeyman", "Intermedio") },
  { min: 0.7, name: o("Engineer", "Ingeniero") },
  { min: 0.9, name: o("Event Loop Master", "Maestro del Event Loop") },
];

export function rankFor(score: number, total: number, locale: Locale): string {
  const r = total ? score / total : 0;
  return [...RANKS].reverse().find((x) => r >= x.min)!.name[locale];
}
