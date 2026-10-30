/** Pure rules of the card-pack minigame: 18 original creature cards, three rarities, a seeded pack of 5 and a collection counter. */
export type Rng = () => number;
type L = { en: string; es: string };

/** Every card shows its painting (public/art/v3/games/<id>.avif / .webp). */
export type PackCard = { id: string; name: L; line: L };

const c = (id: string, en: string, es: string, lineEn: string, lineEs: string): PackCard => ({ id, name: { en, es }, line: { en: lineEn, es: lineEs } });

/** 18 original creatures. Names and flavour lines are invented here; nothing comes from any existing card game. */
export const PACK_CARDS: readonly PackCard[] = [
  c("ember-fox", "Ember Fox", "Zorro de brasa", "Its tail leaves warm paw prints in the snow.", "Su cola deja huellas tibias en la nieve."),
  c("moss-wyrm", "Moss Wyrm", "Sierpe de musgo", "Sleeps so long that ferns grow on its back.", "Duerme tanto que le crecen helechos en el lomo."),
  c("lantern-spirit", "Lantern Spirit", "Espíritu del farol", "It lights the way home, never the way out.", "Ilumina el camino a casa, nunca el de salida."),
  c("storm-owl", "Storm Owl", "Búho de tormenta", "Its hoot arrives a second before the thunder.", "Su ulular llega un segundo antes del trueno."),
  c("stone-sentinel", "Stone Sentinel", "Centinela de piedra", "Has guarded the same bridge since before the bridge.", "Cuida el mismo puente desde antes de que existiera el puente."),
  c("tide-colossus", "Tide Colossus", "Coloso de marea", "Each step is a high tide somewhere.", "Cada paso es una marea alta en algún lugar."),
  c("coffee-golem", "Coffee Golem", "Gólem de café", "Warm hands, slow words, very strong aroma.", "Manos tibias, palabras lentas, aroma muy fuerte."),
  c("cable-car-sprite", "Cable-Car Sprite", "Duende del cable aéreo", "Rides the wire between two mountains for fun.", "Viaja por el cable entre dos montañas por diversión."),
  c("paper-crane", "Paper Crane", "Grulla de papel", "Folded once, it learned to fly forever.", "Doblada una vez, aprendió a volar para siempre."),
  c("tide-pup", "Tide Pup", "Cachorro de marea", "Follows the moon and splashes in every puddle.", "Sigue a la luna y chapotea en cada charco."),
  c("thistle-imp", "Thistle Imp", "Duendecillo de cardo", "Prickly outside, shy inside.", "Espinoso por fuera, tímido por dentro."),
  c("nevado-yeti", "Nevado Yeti", "Yeti del Nevado", "Shares its hot chocolate with lost hikers.", "Comparte su chocolate caliente con caminantes perdidos."),
  c("glass-stag", "Glass Stag", "Ciervo de cristal", "Its antlers ring softly when the wind turns.", "Sus astas suenan suave cuando cambia el viento."),
  c("lava-newt", "Lava Newt", "Tritón de lava", "Swims in cooling rivers of stone.", "Nada en ríos de piedra que se enfría."),
  c("aurora-heron", "Aurora Heron", "Garza de aurora", "Fishes for light in the northern sky.", "Pesca luz en el cielo del norte."),
  c("clockwork-whale", "Clockwork Whale", "Ballena de relojería", "Sings once an hour, perfectly on time.", "Canta una vez por hora, siempre puntual."),
  c("sun-crowned-condor", "Sun-Crowned Condor", "Cóndor de corona solar", "Carries the morning over the highest ridge.", "Lleva la mañana sobre la cumbre más alta."),
  c("moonwell-dragon", "Moonwell Dragon", "Dragón del pozo lunar", "Drinks the reflection of the moon, never the water.", "Bebe el reflejo de la luna, nunca el agua."),
];


export type Rarity = "common" | "uncommon" | "rare";
export const RARITY_ORDER: readonly Rarity[] = ["common", "uncommon", "rare"];
/** Six legends are rare, four are uncommon and the other eight common. */
const RARE = new Set(["ember-fox", "lantern-spirit", "moss-wyrm", "stone-sentinel", "storm-owl", "tide-colossus"]);
const UNCOMMON = new Set(["aurora-heron", "clockwork-whale", "sun-crowned-condor", "moonwell-dragon"]);
export const rarityOf = (id: string): Rarity => (RARE.has(id) ? "rare" : UNCOMMON.has(id) ? "uncommon" : "common");

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
