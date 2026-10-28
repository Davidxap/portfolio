/** Pure rules of the Film Order toy: put 5 films in release order. Only public film facts (title, director, release year in Japan); no artwork. */
export type Film = { id: string; title: string; director: string; year: number };

export const ORDER_GOAL = 5;

export const FILMS: readonly Film[] = [
  { id: "nausicaa", title: "Nausicaä of the Valley of the Wind", director: "Hayao Miyazaki", year: 1984 },
  { id: "castle-sky", title: "Castle in the Sky", director: "Hayao Miyazaki", year: 1986 },
  { id: "totoro", title: "My Neighbor Totoro", director: "Hayao Miyazaki", year: 1988 },
  { id: "kiki", title: "Kiki's Delivery Service", director: "Hayao Miyazaki", year: 1989 },
  { id: "porco-rosso", title: "Porco Rosso", director: "Hayao Miyazaki", year: 1992 },
  { id: "pom-poko", title: "Pom Poko", director: "Isao Takahata", year: 1994 },
  { id: "whisper", title: "Whisper of the Heart", director: "Yoshifumi Kondō", year: 1995 },
  { id: "mononoke", title: "Princess Mononoke", director: "Hayao Miyazaki", year: 1997 },
  { id: "spirited", title: "Spirited Away", director: "Hayao Miyazaki", year: 2001 },
  { id: "cat-returns", title: "The Cat Returns", director: "Hiroyuki Morita", year: 2002 },
  { id: "howl", title: "Howl's Moving Castle", director: "Hayao Miyazaki", year: 2004 },
  { id: "ponyo", title: "Ponyo", director: "Hayao Miyazaki", year: 2008 },
  { id: "arrietty", title: "Arrietty", director: "Hiromasa Yonebayashi", year: 2010 },
  { id: "wind-rises", title: "The Wind Rises", director: "Hayao Miyazaki", year: 2013 },
  { id: "marnie", title: "When Marnie Was There", director: "Hiromasa Yonebayashi", year: 2014 },
  { id: "heron", title: "The Boy and the Heron", director: "Hayao Miyazaki", year: 2023 },
];

const byId = (id: string): Film => FILMS.find((f) => f.id === id)!;
export const filmById = byId;

/** `order` holds film ids as the player has arranged them, first card = oldest guess. */
export type Round = { order: string[]; revealed: boolean };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Release order of the round's films (years are unique, so the order is unambiguous). */
export const correctOrder = (r: Round): string[] => [...r.order].sort((a, b) => byId(a).year - byId(b).year);
export const isSorted = (r: Round): boolean => correctOrder(r).every((id, i) => id === r.order[i]);

/** A fresh round: 5 different films, shuffled, and never already in order. */
export function newRound(seed: number): Round {
  const r = rng(seed);
  const ids = FILMS.map((f) => f.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  let round: Round = { order: ids.slice(0, ORDER_GOAL), revealed: false };
  if (isSorted(round)) round = { ...round, order: [...round.order].reverse() };
  return round;
}

/** Moves the card at `i` one place (dir -1 up, 1 down). Ends clamp; nothing moves after the reveal. */
export function move(r: Round, i: number, dir: -1 | 1): Round {
  const j = i + dir;
  if (r.revealed || i < 0 || j < 0 || i >= r.order.length || j >= r.order.length) return r;
  const order = [...r.order];
  [order[i], order[j]] = [order[j], order[i]];
  return { ...r, order };
}

export const reveal = (r: Round): Round => (r.revealed ? r : { ...r, revealed: true });

/** How many cards sit in their release-order place (0 to 5). */
export function score(r: Round): number {
  const c = correctOrder(r);
  return r.order.filter((id, i) => id === c[i]).length;
}
