// Lab examples from the book. Each one is a stepped trace of a snippet.
// scripts/check/eventloop.mjs runs every example's `code` in Node and asserts its console equals the last step.
import type { Locale } from "./projects";

type L10n = Record<Locale, string>;

export type Step = {
  line: number | null; // 0-based line of `code` being run, null when the engine itself acts
  boxes: string[][]; // one list per panel of the example, in panel order
  out: string[];
  focus?: number; // index of the panel the engine is working on
  note: L10n;
};

export type Example = {
  id: string;
  title: L10n;
  chapter: L10n;
  code: string[];
  panels: L10n[];
  steps: Step[];
};

type Raw = { line: number | null; stack: string[]; micro: string[]; tasks: string[]; out: string[]; note: L10n };

export const code = [
  "console.log('A');",
  "setTimeout(() => console.log('B'), 0);",
  "Promise.resolve().then(() => console.log('C'));",
  "queueMicrotask(() => console.log('D'));",
  "console.log('E');",
];

const eventLoopRaw: Raw[] = [
  { line: null, stack: [], micro: [], tasks: [], out: [],
    note: { en: "The script is about to run. Everything starts empty.", es: "El script está por ejecutarse. Todo empieza vacío." } },
  { line: 0, stack: ["main()", "console.log('A')"], micro: [], tasks: [], out: ["A"],
    note: { en: "Synchronous code runs first, on the call stack. A is printed right away.", es: "El código síncrono corre primero, en la pila de llamadas. A se imprime de inmediato." } },
  { line: 1, stack: ["main()", "setTimeout()"], micro: [], tasks: ["() => log('B')"], out: ["A"],
    note: { en: "setTimeout does not run the callback. It schedules it as a task, even with 0 ms.", es: "setTimeout no ejecuta el callback. Lo agenda como tarea, aunque sea con 0 ms." } },
  { line: 2, stack: ["main()", "Promise.then()"], micro: ["() => log('C')"], tasks: ["() => log('B')"], out: ["A"],
    note: { en: "A resolved promise queues its .then callback as a microtask.", es: "Una promesa resuelta encola su callback .then como microtarea." } },
  { line: 3, stack: ["main()", "queueMicrotask()"], micro: ["() => log('C')", "() => log('D')"], tasks: ["() => log('B')"], out: ["A"],
    note: { en: "queueMicrotask adds another microtask, behind C.", es: "queueMicrotask agrega otra microtarea, detrás de C." } },
  { line: 4, stack: ["main()", "console.log('E')"], micro: ["() => log('C')", "() => log('D')"], tasks: ["() => log('B')"], out: ["A", "E"],
    note: { en: "Still synchronous: E prints before anything that was queued.", es: "Sigue siendo síncrono: E se imprime antes que todo lo encolado." } },
  { line: null, stack: ["() => log('C')"], micro: ["() => log('D')"], tasks: ["() => log('B')"], out: ["A", "E", "C"],
    note: { en: "The stack is empty, so the engine drains the whole microtask queue first. C runs.", es: "La pila quedó vacía, así que el motor vacía primero toda la cola de microtareas. Corre C." } },
  { line: null, stack: ["() => log('D')"], micro: [], tasks: ["() => log('B')"], out: ["A", "E", "C", "D"],
    note: { en: "D runs next. Microtasks always finish before the next task.", es: "Luego corre D. Las microtareas siempre terminan antes de la siguiente tarea." } },
  { line: null, stack: ["() => log('B')"], micro: [], tasks: [], out: ["A", "E", "C", "D", "B"],
    note: { en: "Only now does the event loop take the next task: the timer callback. B prints last.", es: "Solo ahora el event loop toma la siguiente tarea: el callback del timer. B se imprime de último." } },
];

const eventLoopSteps: Step[] = eventLoopRaw.map((r, i) => ({
  line: r.line,
  boxes: [[...r.stack].reverse(), r.micro, r.tasks],
  out: r.out,
  focus: r.line === null ? (i === 0 ? undefined : r.stack.length ? 0 : undefined) : 0,
  note: r.note,
}));

const st = (line: number | null, boxes: string[][], out: string[], en: string, es: string, focus?: number): Step => ({ line, boxes, out, focus, note: { en, es } });

const closuresSteps: Step[] = [
  st(null, [[], [], []], [], "Two loops build arrays of functions. Nothing exists yet.", "Dos bucles arman arreglos de funciones. Todavía no existe nada."),
  st(1, [["i = 0"], ["() => i"], []], [], "var i lives in ONE scope shared by the whole loop. The first arrow function closes over that variable, not over the value 0.", "var i vive en UN solo scope compartido por todo el bucle. La primera flecha cierra sobre esa variable, no sobre el valor 0.", 0),
  st(1, [["i = 3"], ["() => i", "() => i", "() => i"], []], [], "The loop keeps going and i ends at 3. All three functions point at the same i.", "El bucle sigue y i termina en 3. Las tres funciones apuntan a la misma i.", 0),
  st(2, [["i = 3"], ["() => i", "() => i", "() => i"], ["() => j (j = 0)"]], [], "let creates a fresh j for every iteration. The first arrow function captures its own j = 0.", "let crea una j nueva en cada iteración. La primera flecha captura su propia j = 0.", 2),
  st(2, [["i = 3"], ["() => i", "() => i", "() => i"], ["() => j (j = 0)", "() => j (j = 1)", "() => j (j = 2)"]], [], "After three iterations there are three separate j variables, each one frozen with its own value.", "Tras tres iteraciones hay tres variables j separadas, cada una con su propio valor.", 2),
  st(3, [["i = 3"], ["() => i", "() => i", "() => i"], ["() => j (j = 0)", "() => j (j = 1)", "() => j (j = 2)"]], ["3 3 3"], "Calling the var closures reads the shared i, which is 3, three times.", "Llamar las closures de var lee la i compartida, que vale 3, tres veces.", 1),
  st(4, [["i = 3"], ["() => i", "() => i", "() => i"], ["() => j (j = 0)", "() => j (j = 1)", "() => j (j = 2)"]], ["3 3 3", "0 1 2"], "Calling the let closures reads each one's own j: 0 1 2. That is the classic var vs let loop trap.", "Llamar las closures de let lee la j de cada una: 0 1 2. Esa es la trampa clásica de var vs let.", 2),
];

const thisSteps: Step[] = [
  st(null, [[], [], []], [], "this is not decided where a function is written, but at the call. Watch the call-site.", "this no se decide donde se escribe la función sino en la llamada. Mira el sitio de la llamada."),
  st(2, [["user.hi()"], ["user"], ["Ana"]], ["Ana"], "Called as user.hi(), the object before the dot becomes this. this.name is Ana.", "Llamada como user.hi(), el objeto antes del punto pasa a ser this. this.name es Ana.", 1),
  st(3, [["hi.call({ name: 'Bo' })"], ["{ name: 'Bo' }"], ["Bo"]], ["Ana", "Bo"], "call() sets this explicitly for a single call. Same function, different this: Bo.", "call() fija this de forma explícita en una sola llamada. La misma función con otro this: Bo.", 1),
  st(4, [["user.hi.bind({ name: 'Cy' })()"], ["{ name: 'Cy' }"], ["Cy"]], ["Ana", "Bo", "Cy"], "bind() returns a new function with this fixed for good. Calling it gives Cy.", "bind() devuelve una función nueva con this fijado para siempre. Al llamarla da Cy.", 1),
];

const protoSteps: Step[] = [
  st(null, [[], [], []], [], "Property lookup walks the prototype chain: own properties first, then the prototype, then up.", "La búsqueda de propiedades recorre la cadena de prototipos: primero las propias, luego el prototipo, y así hacia arriba."),
  st(2, [["barks: true"], ["eats: true"], ["toString, hasOwnProperty..."]], [], "Object.create(animal) makes dog whose prototype is animal. dog.barks is added as its own property.", "Object.create(animal) crea dog con animal como prototipo. dog.barks se agrega como propiedad propia.", 0),
  st(3, [["barks: true"], ["eats: true"], ["toString, hasOwnProperty..."]], ["true"], "dog.barks is found on dog itself. The search stops at the first hop.", "dog.barks se encuentra en dog. La búsqueda termina en el primer salto.", 0),
  st(4, [["barks: true"], ["eats: true"], ["toString, hasOwnProperty..."]], ["true", "true"], "dog.eats is not on dog, so the engine follows the link to animal and finds it there.", "dog.eats no está en dog, así que el motor sigue el enlace a animal y la encuentra ahí.", 1),
  st(5, [["barks: true"], ["eats: true"], ["toString, hasOwnProperty..."]], ["true", "true", "undefined"], "dog.flies is on none of the three objects. The chain ends at null, and the result is undefined.", "dog.flies no está en ninguno de los tres objetos. La cadena termina en null y el resultado es undefined.", 2),
  st(6, [["barks: true"], ["eats: true"], ["toString, hasOwnProperty..."]], ["true", "true", "undefined", "false"], "Object.hasOwn only checks the object itself, so it is false for eats even though dog.eats works.", "Object.hasOwn mira solo el propio objeto, así que da false para eats aunque dog.eats funcione.", 0),
];

export const examples: Example[] = [
  {
    id: "event-loop",
    title: { en: "Event loop order", es: "Orden del event loop" },
    chapter: { en: "Chapter 3", es: "Capítulo 3" },
    code,
    panels: [{ en: "Call stack", es: "Pila de llamadas" }, { en: "Microtask queue", es: "Cola de microtareas" }, { en: "Task queue", es: "Cola de tareas" }],
    steps: eventLoopSteps,
  },
  {
    id: "closures",
    title: { en: "Closures: var vs let", es: "Closures: var vs let" },
    chapter: { en: "Chapter 1", es: "Capítulo 1" },
    code: [
      "const a = [], b = [];",
      "for (var i = 0; i < 3; i++) a.push(() => i);",
      "for (let j = 0; j < 3; j++) b.push(() => j);",
      "console.log(a.map((f) => f()).join(' '));",
      "console.log(b.map((f) => f()).join(' '));",
    ],
    panels: [{ en: "Shared scope (var)", es: "Scope compartido (var)" }, { en: "Closures over var", es: "Closures sobre var" }, { en: "Closures over let", es: "Closures sobre let" }],
    steps: closuresSteps,
  },
  {
    id: "this",
    title: { en: "this binding", es: "Binding de this" },
    chapter: { en: "Chapter 1", es: "Capítulo 1" },
    code: [
      "const user = { name: 'Ana', hi() { return this.name; } };",
      "const hi = user.hi;",
      "console.log(user.hi());",
      "console.log(hi.call({ name: 'Bo' }));",
      "console.log(user.hi.bind({ name: 'Cy' })());",
    ],
    panels: [{ en: "Call", es: "Llamada" }, { en: "this", es: "this" }, { en: "Returns", es: "Devuelve" }],
    steps: thisSteps,
  },
  {
    id: "prototype",
    title: { en: "Prototype chain lookup", es: "Búsqueda en la cadena de prototipos" },
    chapter: { en: "Chapter 2", es: "Capítulo 2" },
    code: [
      "const animal = { eats: true };",
      "const dog = Object.create(animal);",
      "dog.barks = true;",
      "console.log(dog.barks);",
      "console.log(dog.eats);",
      "console.log(dog.flies);",
      "console.log(Object.hasOwn(dog, 'eats'));",
    ],
    panels: [{ en: "dog", es: "dog" }, { en: "animal (prototype)", es: "animal (prototipo)" }, { en: "Object.prototype", es: "Object.prototype" }],
    steps: protoSteps,
  },
];

// The first example is the original event-loop trace; kept as named exports for existing consumers.
export const steps = examples[0].steps;

// ---------------------------------------------------------------------------------------------------------------
// Event Loop, step by step (arcade cartridge). Each scenario is built by a tiny simulator that only allows legal
// event-loop moves: microtasks drain before the next task, timers fire in delay order, tasks need an idle stack.
// scripts/check/eventloop.mjs runs every scenario's `code` in Node and compares the console with the last frame.
// ---------------------------------------------------------------------------------------------------------------
export type LoopArea = "code" | "stack" | "api" | "micro" | "task" | "console";
export type LoopItem = { id: number; label: string; delay?: number };
export type LoopFrame = {
  line: number | null; // 0-based line of `code` that is running, null when the engine itself acts
  stack: LoopItem[]; // bottom to top
  api: LoopItem[]; // timers waiting in the Web APIs
  micro: LoopItem[]; // microtask queue, next to run first
  tasks: LoopItem[]; // task (macrotask) queue, next to run first
  out: LoopItem[]; // console lines
  from: Record<number, LoopArea>; // tokens that appear in this frame, and where they came from (drives the travel animation)
  focus?: LoopArea; // the area the engine is working on
  paint?: boolean; // the browser may render now
  note: L10n;
};
export type LoopScenario = { id: string; title: L10n; blurb: L10n; code: string[]; frames: LoopFrame[] };

type Entry = LoopItem & { base?: boolean };

function sim(code: string[]) {
  let uid = 0;
  const S = { stack: [] as Entry[], api: [] as Entry[], micro: [] as Entry[], tasks: [] as Entry[], out: [] as Entry[] };
  const frames: LoopFrame[] = [];
  let from: Record<number, LoopArea> = {};
  const item = (label: string, delay?: number, base?: boolean): Entry => ({ id: ++uid, label, ...(delay === undefined ? {} : { delay }), ...(base ? { base } : {}) });
  const plain = (e: Entry): LoopItem => ({ id: e.id, label: e.label, ...(e.delay === undefined ? {} : { delay: e.delay }) });
  const dropTransient = () => { while (S.stack.length && !S.stack[S.stack.length - 1].base) S.stack.pop(); };
  const emit = (line: number | null, focus: LoopArea | undefined, en: string, es: string, paint?: boolean) => {
    if (line !== null && (line < 0 || line >= code.length)) throw new Error(`eventloop: line ${line} is outside the code`);
    frames.push({
      line, stack: S.stack.map(plain), api: S.api.map(plain), micro: S.micro.map(plain), tasks: S.tasks.map(plain), out: S.out.map(plain),
      from, ...(focus ? { focus } : {}), ...(paint ? { paint } : {}), note: { en, es },
    });
    from = {};
  };
  const push = (label: string, base: boolean) => { const e = item(label, undefined, base); S.stack.push(e); from[e.id] = "code"; return e; };
  return {
    frames,
    /** The starting frame: everything empty. */
    start: (en: string, es: string) => emit(null, undefined, en, es),
    /** A function call that stays on the stack until `ret` or the next queue pick (main(), load()...). */
    call: (line: number | null, label: string, en: string, es: string) => { dropTransient(); push(label, true); emit(line, "stack", en, es); },
    /** console.log: a transient call frame on the stack and a new line in the console. */
    log: (line: number, text: string, en: string, es: string) => {
      dropTransient(); push(`console.log('${text}')`, false);
      const o = item(text); S.out.push(o); from[o.id] = "stack";
      emit(line, "console", en, es);
    },
    /** setTimeout: the callback moves from the stack to the Web APIs timer. */
    timer: (line: number, label: string, delay: number, en: string, es: string) => {
      dropTransient(); push("setTimeout()", false);
      const e = item(label, delay); S.api.push(e); from[e.id] = "stack";
      emit(line, "api", en, es);
    },
    /** Promise.then / queueMicrotask / await: the callback or continuation joins the microtask queue. */
    queue: (line: number, via: string, label: string, en: string, es: string) => {
      dropTransient(); push(via, false);
      const e = item(label); S.micro.push(e); from[e.id] = "stack";
      emit(line, "micro", en, es);
    },
    /** A function returns while the rest of the stack keeps running (an async function suspended at await). */
    ret: (line: number, en: string, es: string) => { dropTransient(); S.stack.pop(); emit(line, "stack", en, es); },
    /** Nothing is running: the stack is empty and the loop checks the queues. */
    idle: (en: string, es: string) => { S.stack = []; emit(null, "stack", en, es); },
    /** Time passes: the earliest due timer moves from the Web APIs to the task queue (ties keep scheduling order). */
    fire: (en: string, es: string) => {
      S.stack = [];
      if (!S.api.length) throw new Error("eventloop: no timer to fire");
      let at = 0;
      S.api.forEach((t, i) => { if ((t.delay ?? 0) < (S.api[at].delay ?? 0)) at = i; });
      const [e] = S.api.splice(at, 1); S.tasks.push(e); from[e.id] = "api";
      emit(null, "task", en, es);
    },
    /** The loop moves the oldest microtask onto the empty stack. */
    runMicro: (line: number, en: string, es: string) => {
      S.stack = [];
      const e = S.micro.shift(); if (!e) throw new Error("eventloop: no microtask to run");
      S.stack.push({ ...e, base: true }); emit(line, "stack", en, es);
    },
    /** The loop moves the oldest task onto the empty stack, only when the microtask queue is empty. */
    runTask: (line: number, en: string, es: string) => {
      S.stack = [];
      if (S.micro.length) throw new Error("eventloop: a task cannot start while microtasks are waiting");
      const e = S.tasks.shift(); if (!e) throw new Error("eventloop: no task to run");
      S.stack.push({ ...e, base: true }); emit(line, "stack", en, es);
    },
    /** The browser may render: only between tasks, with the stack and the microtask queue empty. */
    paint: (en: string, es: string) => {
      S.stack = [];
      if (S.micro.length) throw new Error("eventloop: the browser cannot render while microtasks are waiting");
      emit(null, "stack", en, es, true);
    },
  };
}

const orderCode = [
  "console.log('start');",
  "setTimeout(() => console.log('timeout'), 0);",
  "Promise.resolve().then(() => console.log('promise'));",
  "console.log('end');",
];
function orderFrames(): LoopFrame[] {
  const s = sim(orderCode);
  s.start("The script is loaded but nothing has run yet. Step forward, or press play.", "El script está cargado pero aún no corrió nada. Avanza un paso o pulsa reproducir.");
  s.call(null, "main()", "The engine starts the script: main() lands on the call stack.", "El motor inicia el script: main() entra en la pila de llamadas.");
  s.log(0, "start", "console.log('start') is synchronous, so it runs right now and prints start.", "console.log('start') es síncrono, así que corre ya e imprime start.");
  s.timer(1, "timeout cb", 0, "setTimeout hands its callback to the browser's timer (Web APIs); it does not run now, even with 0 ms.", "setTimeout entrega su callback al temporizador del navegador (Web APIs); no corre ahora, ni con 0 ms.");
  s.queue(2, "Promise.then()", "then(promise)", "The promise is already resolved, so .then puts its callback straight into the microtask queue.", "La promesa ya está resuelta, así que .then pone su callback directo en la cola de microtareas.");
  s.log(3, "end", "This is still synchronous code, so end prints before any callback gets a turn.", "Sigue siendo código síncrono, así que end se imprime antes de que cualquier callback tenga turno.");
  s.idle("The script is done and the call stack is empty, so the event loop can look at the queues.", "El script terminó y la pila está vacía, así que el event loop puede revisar las colas.");
  s.fire("The 0 ms timer has expired, so the browser moves its callback into the task queue.", "El temporizador de 0 ms venció, así que el navegador mueve su callback a la cola de tareas.");
  s.runMicro(2, "Microtasks go first: the event loop moves the promise callback onto the empty stack.", "Las microtareas van primero: el event loop mueve el callback de la promesa a la pila vacía.");
  s.log(2, "promise", "The callback prints promise, ahead of the timer callback that has been waiting longer.", "El callback imprime promise, antes que el del temporizador, que llevaba más tiempo esperando.");
  s.runTask(1, "The microtask queue is empty, so the event loop now takes one task: the timer callback.", "La cola de microtareas quedó vacía, así que el event loop toma ahora una tarea: el callback del temporizador.");
  s.log(1, "timeout", "The timer callback finally prints timeout.", "El callback del temporizador por fin imprime timeout.");
  s.idle("Everything is empty again. The order was start, end, promise, timeout.", "Todo quedó vacío otra vez. El orden fue start, end, promise, timeout.");
  return s.frames;
}

const nestedCode = [
  "Promise.resolve().then(() => {",
  "  console.log('micro 1');",
  "  Promise.resolve().then(() => console.log('micro 2'));",
  "});",
  "setTimeout(() => console.log('task'), 0);",
  "console.log('sync');",
];
function nestedFrames(): LoopFrame[] {
  const s = sim(nestedCode);
  s.start("Can a microtask queue another microtask? Step through to see where it lands.", "¿Puede una microtarea encolar otra microtarea? Avanza para ver dónde queda.");
  s.call(null, "main()", "The script starts running on the call stack.", "El script empieza a correr en la pila de llamadas.");
  s.queue(0, "Promise.then()", "then(micro 1)", "The first .then callback goes into the microtask queue.", "El primer callback de .then va a la cola de microtareas.");
  s.timer(4, "timeout(task)", 0, "The timer callback waits in the Web APIs, then becomes a task.", "El callback del temporizador espera en las Web APIs y luego será una tarea.");
  s.log(5, "sync", "Synchronous code finishes first and prints sync.", "El código síncrono termina primero e imprime sync.");
  s.idle("The stack is empty, so the loop checks the queues.", "La pila está vacía, así que el loop revisa las colas.");
  s.fire("The timer expired, so its callback waits in the task queue.", "El temporizador venció, así que su callback espera en la cola de tareas.");
  s.runMicro(1, "The first microtask runs from the empty stack.", "La primera microtarea corre desde la pila vacía.");
  s.log(1, "micro 1", "It prints micro 1.", "Imprime micro 1.");
  s.queue(2, "Promise.then()", "then(micro 2)", "While running, it queues another microtask at the back of the same queue.", "Mientras corre, encola otra microtarea al final de la misma cola.");
  s.runMicro(2, "The loop keeps draining microtasks, including the one just added, before any task.", "El loop sigue vaciando microtareas, incluida la recién agregada, antes de cualquier tarea.");
  s.log(2, "micro 2", "micro 2 prints while the task is still waiting.", "micro 2 se imprime mientras la tarea sigue esperando.");
  s.runTask(4, "Only now, with no microtasks left, does the loop take the task.", "Solo ahora, sin microtareas pendientes, el loop toma la tarea.");
  s.log(4, "task", "The task prints task, last.", "La tarea imprime task, al final.");
  s.idle("Done. Microtasks added by microtasks still run before the next task.", "Listo. Las microtareas creadas por microtareas siguen corriendo antes de la próxima tarea.");
  return s.frames;
}

const asyncCode = [
  "async function load() {",
  "  console.log('load: start');",
  "  await null;",
  "  console.log('load: resumed');",
  "}",
  "load();",
  "setTimeout(() => console.log('timer'), 0);",
  "console.log('after call');",
];
function asyncFrames(): LoopFrame[] {
  const s = sim(asyncCode);
  s.start("An async function runs like normal code until its first await. Let's watch it pause.", "Una función async corre como código normal hasta su primer await. Veamos cómo se pausa.");
  s.call(null, "main()", "The script starts on the call stack.", "El script empieza en la pila de llamadas.");
  s.call(5, "load()", "Calling load() pushes it on top of main() and runs its body synchronously.", "Llamar a load() la apila sobre main() y ejecuta su cuerpo de forma síncrona.");
  s.log(1, "load: start", "Before the await, everything is synchronous: load: start prints now.", "Antes del await todo es síncrono: load: start se imprime ahora.");
  s.queue(2, "await null", "load() continues", "await pauses load() and queues the rest of the function as a microtask.", "await pausa load() y encola el resto de la función como microtarea.");
  s.ret(5, "load() returns to its caller, so the code after the call can keep going.", "load() devuelve el control a quien la llamó, así que el código posterior sigue.");
  s.timer(6, "timeout(timer)", 0, "The timer callback is handed to the Web APIs.", "El callback del temporizador se entrega a las Web APIs.");
  s.log(7, "after call", "The next line of main() runs before load() resumes: after call prints.", "La siguiente línea de main() corre antes de que load() continúe: se imprime after call.");
  s.idle("main() is done and the stack is empty.", "main() terminó y la pila está vacía.");
  s.fire("The timer expired: its callback joins the task queue.", "El temporizador venció: su callback entra en la cola de tareas.");
  s.runMicro(3, "The continuation of load() is a microtask, so it resumes before the timer task.", "La continuación de load() es una microtarea, así que se reanuda antes que la tarea del temporizador.");
  s.log(3, "load: resumed", "After the await, load: resumed prints.", "Después del await se imprime load: resumed.");
  s.runTask(6, "With no microtasks left, the loop runs the timer task.", "Sin microtareas pendientes, el loop ejecuta la tarea del temporizador.");
  s.log(6, "timer", "The timer prints last.", "El temporizador imprime al final.");
  s.idle("Everything after an await runs as a microtask, so it beats timers.", "Todo lo que sigue a un await corre como microtarea, por eso le gana a los temporizadores.");
  return s.frames;
}

const delaysCode = [
  "setTimeout(() => console.log('slow 50ms'), 50);",
  "setTimeout(() => console.log('fast 10ms'), 10);",
  "queueMicrotask(() => console.log('microtask'));",
  "console.log('sync');",
];
function delaysFrames(): LoopFrame[] {
  const s = sim(delaysCode);
  s.start("Two timers, one microtask. Who finishes first? Time matters only for timers.", "Dos temporizadores y una microtarea. ¿Quién termina primero? El tiempo solo importa para los temporizadores.");
  s.call(null, "main()", "The script starts on the call stack.", "El script empieza en la pila de llamadas.");
  s.timer(0, "slow cb", 50, "The first timer waits 50 ms in the Web APIs.", "El primer temporizador espera 50 ms en las Web APIs.");
  s.timer(1, "fast cb", 10, "The second timer was scheduled later but only waits 10 ms.", "El segundo temporizador se programó después pero solo espera 10 ms.");
  s.queue(2, "queueMicrotask()", "microtask cb", "queueMicrotask adds a callback to the microtask queue directly.", "queueMicrotask agrega un callback directo a la cola de microtareas.");
  s.log(3, "sync", "Synchronous code prints sync.", "El código síncrono imprime sync.");
  s.idle("The stack is empty, so the loop looks at the queues.", "La pila está vacía, así que el loop revisa las colas.");
  s.runMicro(2, "Microtasks always go first, while both timers are still counting down.", "Las microtareas siempre van primero, mientras los dos temporizadores siguen contando.");
  s.log(2, "microtask", "The microtask prints microtask.", "La microtarea imprime microtask.");
  s.fire("10 ms pass: the fast timer expires first, even though it was scheduled second.", "Pasan 10 ms: vence primero el temporizador rápido, aunque se programó en segundo lugar.");
  s.runTask(1, "The loop takes the only task in the queue.", "El loop toma la única tarea de la cola.");
  s.log(1, "fast 10ms", "It prints fast 10ms.", "Imprime fast 10ms.");
  s.fire("50 ms pass: now the slow timer expires and queues its callback.", "Pasan 50 ms: ahora vence el temporizador lento y encola su callback.");
  s.runTask(0, "The loop runs the last task.", "El loop ejecuta la última tarea.");
  s.log(0, "slow 50ms", "It prints slow 50ms. Timers run by delay, not by line order.", "Imprime slow 50ms. Los temporizadores corren por su retraso, no por el orden de las líneas.");
  s.idle("All queues are empty.", "Todas las colas quedaron vacías.");
  return s.frames;
}

const paintCode = [
  "setTimeout(() => console.log('task 1'), 0);",
  "setTimeout(() => console.log('task 2'), 0);",
  "Promise.resolve().then(() => console.log('microtask'));",
  "console.log('sync');",
];
function paintFrames(): LoopFrame[] {
  const s = sim(paintCode);
  s.start("In a browser, the page can only repaint between tasks. Watch when that window opens.", "En un navegador la página solo puede repintarse entre tareas. Observa cuándo se abre esa ventana.");
  s.call(null, "main()", "The script starts on the call stack, and the page cannot repaint while it runs.", "El script empieza en la pila y la página no puede repintarse mientras corre.");
  s.timer(0, "task 1 cb", 0, "The first timer callback goes to the Web APIs.", "El primer callback de temporizador va a las Web APIs.");
  s.timer(1, "task 2 cb", 0, "The second timer callback follows it.", "El segundo callback de temporizador va detrás.");
  s.queue(2, "Promise.then()", "then(microtask)", "The promise callback joins the microtask queue.", "El callback de la promesa entra en la cola de microtareas.");
  s.log(3, "sync", "sync prints.", "Se imprime sync.");
  s.idle("The script is over and the stack is empty.", "El script terminó y la pila está vacía.");
  s.fire("Both timers expired. The first one enters the task queue.", "Los dos temporizadores vencieron. El primero entra en la cola de tareas.");
  s.fire("The second one lines up behind it.", "El segundo se pone en fila detrás.");
  s.runMicro(2, "Microtasks run first, and the browser cannot paint in between.", "Las microtareas corren primero y el navegador no puede pintar entre ellas.");
  s.log(2, "microtask", "microtask prints.", "Se imprime microtask.");
  s.paint("Stack and microtasks are empty: the browser may repaint here, before the next task.", "Pila y microtareas vacías: el navegador puede repintar aquí, antes de la siguiente tarea.");
  s.runTask(0, "The loop takes the first task.", "El loop toma la primera tarea.");
  s.log(0, "task 1", "task 1 prints.", "Se imprime task 1.");
  s.paint("Another gap between tasks: the browser may render again.", "Otro hueco entre tareas: el navegador puede renderizar de nuevo.");
  s.runTask(1, "The loop takes the second task.", "El loop toma la segunda tarea.");
  s.log(1, "task 2", "task 2 prints. A long task or microtask chain would delay every repaint.", "Se imprime task 2. Una tarea larga o una cadena de microtareas retrasaría cada repintado.");
  s.idle("Done. Heavy synchronous work freezes the page because it blocks this loop.", "Listo. El trabajo síncrono pesado congela la página porque bloquea este loop.");
  return s.frames;
}

export const scenarios: LoopScenario[] = [
  { id: "order", title: { en: "setTimeout vs Promise", es: "setTimeout vs Promise" }, blurb: { en: "Why a promise beats a 0 ms timer", es: "Por qué una promesa le gana a un temporizador de 0 ms" }, code: orderCode, frames: orderFrames() },
  { id: "nested", title: { en: "Nested microtasks", es: "Microtareas anidadas" }, blurb: { en: "A microtask that queues another one", es: "Una microtarea que encola otra" }, code: nestedCode, frames: nestedFrames() },
  { id: "async", title: { en: "async / await", es: "async / await" }, blurb: { en: "What happens at an await", es: "Qué pasa en un await" }, code: asyncCode, frames: asyncFrames() },
  { id: "delays", title: { en: "queueMicrotask and delays", es: "queueMicrotask y retrasos" }, blurb: { en: "Timers run by delay, microtasks first", es: "Los temporizadores van por retraso y las microtareas primero" }, code: delaysCode, frames: delaysFrames() },
  { id: "paint", title: { en: "Render between tasks", es: "Render entre tareas" }, blurb: { en: "When the browser can repaint", es: "Cuándo puede repintar el navegador" }, code: paintCode, frames: paintFrames() },
];
