/** Pure rules of the card-pack minigame: 18 original creature cards, three rarities, a seeded pack of 5 and a collection counter. */
export type Rng = () => number;
type L = { en: string; es: string };

export type ArtKind = "fox" | "bird" | "serpent" | "golem" | "wisp" | "whale";
export type Art = { kind: ArtKind; hue: number; trait?: string; scene: "ember" | "water" | "storm" | "stone" | "forest" | "night" | "snow" | "city" | "sun" };
/** `painted` cards use David's painted art (public/art/v3/games/<id>.avif); the others are drawn as SVG. */
export type PackCard = { id: string; name: L; art: Art; line: L; painted: boolean };

const PAINTED = new Set(["ember-fox", "lantern-spirit", "moss-wyrm", "stone-sentinel", "storm-owl", "tide-colossus"]);
const c = (id: string, en: string, es: string, art: Art, lineEn: string, lineEs: string): PackCard =>
  ({ id, name: { en, es }, art, line: { en: lineEn, es: lineEs }, painted: PAINTED.has(id) });

/** 18 original creatures. Names and flavour lines are invented here; nothing comes from any existing card game. */
export const PACK_CARDS: readonly PackCard[] = [
  c("ember-fox", "Ember Fox", "Zorro de brasa", { kind: "fox", hue: 22, trait: "flame", scene: "ember" }, "Its tail leaves warm paw prints in the snow.", "Su cola deja huellas tibias en la nieve."),
  c("moss-wyrm", "Moss Wyrm", "Sierpe de musgo", { kind: "serpent", hue: 112, trait: "moss", scene: "forest" }, "Sleeps so long that ferns grow on its back.", "Duerme tanto que le crecen helechos en el lomo."),
  c("lantern-spirit", "Lantern Spirit", "Espíritu del farol", { kind: "wisp", hue: 44, trait: "lantern", scene: "night" }, "It lights the way home, never the way out.", "Ilumina el camino a casa, nunca el de salida."),
  c("storm-owl", "Storm Owl", "Búho de tormenta", { kind: "bird", hue: 232, trait: "bolt", scene: "storm" }, "Its hoot arrives a second before the thunder.", "Su ulular llega un segundo antes del trueno."),
  c("stone-sentinel", "Stone Sentinel", "Centinela de piedra", { kind: "golem", hue: 210, trait: "crest", scene: "stone" }, "Has guarded the same bridge since before the bridge.", "Cuida el mismo puente desde antes de que existiera el puente."),
  c("tide-colossus", "Tide Colossus", "Coloso de marea", { kind: "whale", hue: 200, trait: "tide", scene: "water" }, "Each step is a high tide somewhere.", "Cada paso es una marea alta en algún lugar."),
  c("coffee-golem", "Coffee Golem", "Gólem de café", { kind: "golem", hue: 24, trait: "steam", scene: "city" }, "Warm hands, slow words, very strong aroma.", "Manos tibias, palabras lentas, aroma muy fuerte."),
  c("cable-car-sprite", "Cable-Car Sprite", "Duende del cable aéreo", { kind: "wisp", hue: 190, trait: "cabin", scene: "sun" }, "Rides the wire between two mountains for fun.", "Viaja por el cable entre dos montañas por diversión."),
  c("paper-crane", "Paper Crane", "Grulla de papel", { kind: "bird", hue: 36, trait: "origami", scene: "sun" }, "Folded once, it learned to fly forever.", "Doblada una vez, aprendió a volar para siempre."),
  c("tide-pup", "Tide Pup", "Cachorro de marea", { kind: "fox", hue: 190, trait: "wave", scene: "water" }, "Follows the moon and splashes in every puddle.", "Sigue a la luna y chapotea en cada charco."),
  c("thistle-imp", "Thistle Imp", "Duendecillo de cardo", { kind: "wisp", hue: 285, trait: "thorn", scene: "forest" }, "Prickly outside, shy inside.", "Espinoso por fuera, tímido por dentro."),
  c("nevado-yeti", "Nevado Yeti", "Yeti del Nevado", { kind: "golem", hue: 196, trait: "fur", scene: "snow" }, "Shares its hot chocolate with lost hikers.", "Comparte su chocolate caliente con caminantes perdidos."),
  c("glass-stag", "Glass Stag", "Ciervo de cristal", { kind: "fox", hue: 170, trait: "antlers", scene: "night" }, "Its antlers ring softly when the wind turns.", "Sus astas suenan suave cuando cambia el viento."),
  c("lava-newt", "Lava Newt", "Tritón de lava", { kind: "fox", hue: 8, trait: "newt", scene: "ember" }, "Swims in cooling rivers of stone.", "Nada en ríos de piedra que se enfría."),
  c("aurora-heron", "Aurora Heron", "Garza de aurora", { kind: "bird", hue: 160, trait: "aurora", scene: "night" }, "Fishes for light in the northern sky.", "Pesca luz en el cielo del norte."),
  c("clockwork-whale", "Clockwork Whale", "Ballena de relojería", { kind: "whale", hue: 42, trait: "gears", scene: "night" }, "Sings once an hour, perfectly on time.", "Canta una vez por hora, siempre puntual."),
  c("sun-crowned-condor", "Sun-Crowned Condor", "Cóndor de corona solar", { kind: "bird", hue: 40, trait: "crown", scene: "sun" }, "Carries the morning over the highest ridge.", "Lleva la mañana sobre la cumbre más alta."),
  c("moonwell-dragon", "Moonwell Dragon", "Dragón del pozo lunar", { kind: "serpent", hue: 262, trait: "wings", scene: "night" }, "Drinks the reflection of the moon, never the water.", "Bebe el reflejo de la luna, nunca el agua."),
];


export type Rarity = "common" | "uncommon" | "rare";
export const RARITY_ORDER: readonly Rarity[] = ["common", "uncommon", "rare"];
/** The six painted creatures are the rare ones; four of the drawn ones are uncommon and the other eight common. */
const UNCOMMON = new Set(["aurora-heron", "clockwork-whale", "sun-crowned-condor", "moonwell-dragon"]);
export const rarityOf = (id: string): Rarity => (PAINTED.has(id) ? "rare" : UNCOMMON.has(id) ? "uncommon" : "common");

export const PACK_SIZE = 5;
export const TOTAL_CARDS = PACK_CARDS.length;

/** Chance of each rarity for a normal slot, and for the last slot, which is always at least uncommon. */
const SLOT_ODDS: Record<Rarity, number> = { common: 0.72, uncommon: 0.21, rare: 0.07 };
const HIT_ODDS: Record<Rarity, number> = { common: 0, uncommon: 0.78, rare: 0.22 };

/** Small, fast seeded generator (mulberry32): the same seed always deals the same game. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


function roll(odds: Record<Rarity, number>, rng: Rng): Rarity {
  const x = rng();
  return x < odds.rare ? "rare" : x < odds.rare + odds.uncommon ? "uncommon" : "common";
}

/** Opens one pack: 5 different cards, the last slot at least uncommon, shown from the most common to the rarest. */
export function openPack(rng: Rng): string[] {
  const picked: string[] = [];
  for (let slot = 0; slot < PACK_SIZE; slot++) {
    const want = roll(slot === PACK_SIZE - 1 ? HIT_ODDS : SLOT_ODDS, rng);
    const fresh = PACK_CARDS.filter((c) => !picked.includes(c.id));
    const same = fresh.filter((c) => rarityOf(c.id) === want);
    const better = fresh.filter((c) => RARITY_ORDER.indexOf(rarityOf(c.id)) > RARITY_ORDER.indexOf(want));
    const pool = same.length ? same : better.length ? better : fresh;
    picked.push(pool[Math.floor(rng() * pool.length)].id);
  }
  return picked.sort((a, b) => RARITY_ORDER.indexOf(rarityOf(a)) - RARITY_ORDER.indexOf(rarityOf(b)));
}

/** Adds the cards of a pack to the collection: each card counts once, in the order it was found. Unknown ids are ignored. */
export function collect(collection: readonly string[], pack: readonly string[]): string[] {
  const out = [...collection];
  for (const id of pack) if (PACK_CARDS.some((c) => c.id === id) && !out.includes(id)) out.push(id);
  return out;
}
