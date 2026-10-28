import { useId } from "react";
import type { Art } from "@/lib/games/packs";
import { withBase } from "@/lib/base";

/** Painterly SVG scenes and creatures for the card-pack cards: layered gradients, soft light and a paper grain. All shapes are drawn here, nothing is imported. */
const hsl = (h: number, s: number, l: number, a = 1) => `hsl(${((h % 360) + 360) % 360} ${s}% ${l}% / ${a})`;

type P = { h: number; main: string; dark: string; deep: string; light: string; glow: string };
const palette = (h: number): P => ({ h, main: hsl(h, 62, 50), dark: hsl(h + 14, 66, 30), deep: hsl(h + 24, 60, 17), light: hsl(h - 6, 82, 78), glow: hsl(h - 10, 95, 68) });

function Scene({ scene, p, id }: { scene: Art["scene"]; p: P; id: string }) {
  const sky: Record<Art["scene"], [string, string]> = {
    ember: [hsl(p.h + 330, 45, 14), hsl(p.h + 10, 80, 42)],
    water: [hsl(210, 55, 16), hsl(185, 55, 44)],
    storm: [hsl(245, 45, 12), hsl(255, 30, 38)],
    stone: [hsl(215, 28, 18), hsl(28, 45, 52)],
    forest: [hsl(150, 40, 12), hsl(95, 40, 38)],
    night: [hsl(250, 50, 10), hsl(p.h, 45, 30)],
    snow: [hsl(205, 50, 52), hsl(195, 60, 90)],
    city: [hsl(265, 40, 22), hsl(24, 85, 62)],
    sun: [hsl(24, 70, 52), hsl(46, 95, 80)],
  };
  const [top, bot] = sky[scene];
  return (
    <g>
      <rect width="120" height="100" fill={`url(#${id}-sky)`} />
      <defs><linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      {scene === "night" && <>
        <circle cx="92" cy="22" r="11" fill={hsl(48, 90, 90)} opacity=".95" /><circle cx="96" cy="19" r="10" fill={hsl(250, 45, 14)} opacity=".0" />
        <circle cx="92" cy="22" r="19" fill={hsl(48, 90, 80)} opacity=".16" />
        {[[14, 14], [30, 30], [52, 10], [70, 26], [104, 48], [22, 52], [8, 36]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 0.7 : 1.1} fill="#fff" opacity=".8" />)}
      </>}
      {scene === "sun" && <>
        <circle cx="60" cy="58" r="26" fill={hsl(46, 100, 88)} opacity=".6" /><circle cx="60" cy="58" r="14" fill={hsl(48, 100, 94)} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M60 58 L56 -20 L64 -20 Z" fill={hsl(46, 100, 85)} opacity=".16" transform={`rotate(${i * 30} 60 58)`} />)}
      </>}
      {scene === "storm" && <>
        <g fill={hsl(250, 28, 22)} opacity=".95"><ellipse cx="26" cy="22" rx="34" ry="12" /><ellipse cx="86" cy="16" rx="38" ry="13" /><ellipse cx="60" cy="34" rx="30" ry="9" fill={hsl(250, 30, 30)} /></g>
        <path d="M70 30 L60 52 L68 52 L58 74" fill="none" stroke={hsl(55, 100, 85)} strokeWidth="2.2" strokeLinejoin="round" opacity=".9" />
        <path d="M70 30 L60 52 L68 52 L58 74" fill="none" stroke={hsl(55, 100, 80)} strokeWidth="7" opacity=".18" />
      </>}
      {scene === "ember" && <><circle cx="60" cy="90" r="46" fill={p.glow} opacity=".28" />{[[18, 30], [96, 22], [40, 14], [78, 44], [104, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.2} fill={hsl(40, 100, 75)} opacity=".8" />)}</>}
      {scene === "water" && <>
        <circle cx="26" cy="22" r="10" fill={hsl(190, 80, 90)} opacity=".35" />
        {[58, 66, 74].map((y, i) => <path key={y} d={`M-5 ${y} q15 -${5 + i} 30 0 t30 0 t30 0 t30 0 t30 0`} fill="none" stroke={hsl(190, 70, 82)} strokeWidth=".9" opacity={0.5 - i * 0.1} />)}
      </>}
      {scene === "forest" && <g fill={hsl(150, 45, 10)} opacity=".85">{[8, 30, 100, 114].map((x, i) => <path key={x} d={`M${x} 92 L${x - 9} 92 L${x - 1} ${44 + i * 4} L${x - 7} ${44 + i * 4} L${x} ${22 + i * 6} L${x + 7} ${44 + i * 4} L${x + 1} ${44 + i * 4} L${x + 9} 92Z`} />)}</g>}
      {scene === "stone" && <g fill={hsl(215, 22, 14)} opacity=".9"><rect x="6" y="36" width="12" height="56" rx="2" /><rect x="102" y="30" width="12" height="62" rx="2" /><path d="M6 36 Q60 -2 114 30 L114 40 Q60 8 6 44Z" /></g>}
      {scene === "snow" && <>
        <path d="M-5 70 L28 24 L50 56 L72 18 L125 70Z" fill={hsl(205, 35, 82)} /><path d="M28 24 L36 38 L28 34 L20 40Z M72 18 L82 36 L72 32 L62 38Z" fill="#fff" />
        <path d="M-5 70 L28 24 L50 56 L72 18 L125 70Z" fill={hsl(215, 40, 40)} opacity=".18" />
      </>}
      {scene === "city" && <g fill={hsl(268, 38, 14)}>
        {[[6, 52, 14], [20, 44, 12], [34, 56, 16], [86, 48, 14], [100, 40, 14]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={92 - y} />)}
        {[[10, 58], [24, 52], [40, 64], [90, 56], [104, 48]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" fill={hsl(44, 100, 70)} />)}
      </g>}
      {/* ground: dark painted hill with a soft rim of light */}
      <path d="M-5 82 Q30 74 60 80 T125 78 V105 H-5Z" fill={hsl(p.h + 20, 40, 12)} />
      <path d="M-5 82 Q30 74 60 80 T125 78" fill="none" stroke={p.glow} strokeWidth=".8" opacity=".45" />
    </g>
  );
}

const Eye = ({ x, y, r = 2.4, c }: { x: number; y: number; r?: number; c: string }) => (
  <g><circle cx={x} cy={y} r={r} fill={hsl(45, 90, 92)} /><circle cx={x + r * 0.15} cy={y} r={r * 0.62} fill={c} /><circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" /></g>
);

function Fox({ p, trait, id }: { p: P; trait?: string; id: string }) {
  const stag = trait === "antlers", newt = trait === "newt", flame = trait === "flame", wave = trait === "wave";
  const leg = stag ? 22 : newt ? 7 : 13;
  const by = 84 - leg - 10;
  return (
    <g>
      <ellipse cx="60" cy="86" rx="30" ry="3.5" fill="#000" opacity=".35" />
      {/* tail */}
      {flame && <path d={`M42 ${by + 4} C22 ${by + 6} 6 ${by - 10} 12 ${by - 34} C22 ${by - 20} 30 ${by - 8} 44 ${by + 8}Z`} fill={`url(#${id}-flame)`} />}
      {!flame && !newt && !wave && !stag && <path d={`M42 ${by + 2} C22 ${by + 4} 14 ${by - 18} 22 ${by - 24} C32 ${by - 14} 40 ${by - 6} 44 ${by + 8}Z`} fill={p.main} />}
      {wave && <path d={`M42 ${by + 4} C24 ${by + 6} 18 ${by - 6} 12 ${by - 12} C18 ${by - 16} 24 ${by - 4} 28 ${by - 8} C26 ${by - 20} 36 ${by - 18} 38 ${by - 10} L44 ${by + 6}Z`} fill={hsl(p.h, 70, 62)} />}
      {newt && <path d={`M40 ${by + 4} C26 ${by + 8} 14 ${by + 2} 6 ${by + 12} C14 ${by + 14} 28 ${by + 14} 42 ${by + 12}Z`} fill={p.dark} />}
      {stag && <path d={`M42 ${by} C34 ${by + 2} 30 ${by - 6} 28 ${by - 10} C36 ${by - 8} 42 ${by - 4} 46 ${by + 4}Z`} fill={p.main} />}
      {/* legs */}
      {[48, 56, 70, 78].map((x, i) => <rect key={x} x={x - 2.2} y={by + 10} width="4.4" height={leg + (i % 2 ? 0 : -1)} rx="2" fill={i % 2 ? p.dark : p.deep} />)}
      {/* body */}
      <ellipse cx="62" cy={by + 4} rx={newt ? 28 : 21} ry={newt ? 8 : 11} fill={`url(#${id}-body)`} />
      <ellipse cx="62" cy={by + 10} rx={newt ? 22 : 15} ry="5" fill={p.light} opacity=".28" />
      {newt && [48, 60, 72].map((x) => <circle key={x} cx={x} cy={by + 1} r="2" fill={hsl(48, 100, 62)} opacity=".9" />)}
      {/* head */}
      <g transform={`translate(${stag ? 84 : 82} ${stag ? by - 14 : by - 8})`}>
        {stag ? <path d="M-3 22 L2 2 L10 4 L9 22Z" fill={p.main} /> : null}
        <ellipse cx="3" cy="2" rx="11" ry="9" fill={p.main} />
        <path d="M8 3 L21 8 L9 12Z" fill={p.light} />
        <circle cx="21" cy="8" r="1.7" fill={p.deep} />
        {!newt && <><path d="M-4 -4 L-2 -17 L5 -7Z" fill={p.dark} /><path d="M3 -7 L9 -17 L12 -3Z" fill={p.main} /></>}
        <Eye x={7} y={0} r={2.1} c={p.deep} />
        {stag && <g stroke={hsl(p.h, 80, 82)} strokeWidth="1.5" strokeLinecap="round" fill="none"><path d="M0 -6 L-4 -22 M-4 -16 L-10 -20 M-2 -12 L-8 -13" /><path d="M8 -7 L12 -23 M11 -17 L17 -21 M10 -12 L16 -13" /></g>}
      </g>
    </g>
  );
}

function Bird({ p, trait, id }: { p: P; trait?: string; id: string }) {
  if (trait === "origami") {
    return (
      <g>
        <ellipse cx="60" cy="86" rx="22" ry="3" fill="#000" opacity=".3" />
        <path d="M24 56 L60 44 L66 62 Z" fill={hsl(36, 60, 90)} /><path d="M24 56 L60 44 L52 36Z" fill={hsl(36, 50, 80)} />
        <path d="M60 44 L98 24 L80 62 L66 62Z" fill={hsl(36, 60, 96)} /><path d="M60 44 L98 24 L84 40Z" fill={hsl(36, 50, 84)} />
        <path d="M66 62 L80 62 L92 86 L70 70Z" fill={hsl(36, 55, 82)} /><path d="M52 36 L40 24 L48 34Z" fill={hsl(10, 70, 55)} />
        <path d="M60 44 L66 62 L52 50Z" fill={hsl(36, 40, 70)} /><circle cx="44" cy="46" r="1.2" fill={p.deep} />
        <path d="M60 44 L98 24 M60 44 L66 62 M60 44 L24 56" stroke={hsl(36, 40, 60)} strokeWidth=".6" fill="none" />
      </g>
    );
  }
  if (trait === "aurora") {
    return (
      <g>
        <ellipse cx="60" cy="86" rx="26" ry="3" fill="#000" opacity=".3" />
        <path d="M-5 60 Q30 40 60 56 T125 44 V30 Q90 40 60 30 T-5 40Z" fill={hsl(150, 90, 62)} opacity=".18" />
        <path d="M-5 50 Q30 34 62 48 T125 34" fill="none" stroke={hsl(170, 95, 70)} strokeWidth="5" opacity=".3" /><path d="M-5 50 Q30 34 62 48 T125 34" fill="none" stroke={hsl(290, 80, 70)} strokeWidth="2" opacity=".35" />
        <path d="M50 84 L52 60 M60 84 L58 60" stroke={p.dark} strokeWidth="1.6" />
        <path d="M44 62 C40 50 58 46 72 52 C78 56 72 64 60 64Z" fill={`url(#${id}-body)`} />
        <path d="M70 54 C80 40 82 24 76 18" fill="none" stroke={p.main} strokeWidth="5" strokeLinecap="round" /><circle cx="76" cy="17" r="5" fill={p.main} />
        <path d="M80 17 L98 19 L81 21Z" fill={hsl(40, 90, 62)} /><Eye x={76} y={16} r={1.8} c={p.deep} />
        <path d="M44 60 C32 62 28 56 20 58 C30 52 40 52 48 54Z" fill={p.glow} opacity=".8" />
        <path d="M56 56 C64 46 76 46 84 52 C76 60 64 62 56 60Z" fill={p.dark} opacity=".85" />
      </g>
    );
  }
  if (trait === "crown") {
    return (
      <g>
        <ellipse cx="60" cy="86" rx="22" ry="3" fill="#000" opacity=".3" />
        <path d="M60 52 C40 44 18 40 2 54 C14 52 26 60 36 70 C44 62 52 60 60 62Z" fill={`url(#${id}-body)`} /><path d="M60 52 C80 44 102 40 118 54 C106 52 94 60 84 70 C76 62 68 60 60 62Z" fill={`url(#${id}-body)`} />
        <path d="M6 54 L16 60 M12 52 L24 62 M114 54 L104 60 M108 52 L96 62" stroke={p.light} strokeWidth="1" opacity=".5" />
        <ellipse cx="60" cy="62" rx="9" ry="16" fill={p.dark} />
        <path d="M50 52 Q60 42 70 52 Q60 58 50 52Z" fill="#f3e9d8" opacity=".95" />
        <circle cx="60" cy="42" r="7" fill={hsl(10, 40, 62)} /><path d="M60 40 L70 44 L62 48Z" fill={hsl(44, 90, 56)} /><Eye x={58} y={40} r={1.6} c={p.deep} />
        <path d="M52 36 L54 28 L58 33 L60 26 L62 33 L66 28 L68 36Z" fill={hsl(46, 100, 62)} stroke={hsl(40, 90, 40)} strokeWidth=".5" />
        <circle cx="60" cy="34" r="9" fill={hsl(46, 100, 80)} opacity=".25" />
      </g>
    );
  }
  // owl
  return (
    <g>
      <ellipse cx="60" cy="86" rx="22" ry="3" fill="#000" opacity=".35" />
      <path d="M26 82 H94" stroke={hsl(30, 30, 20)} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="60" rx="20" ry="24" fill={`url(#${id}-body)`} />
      <ellipse cx="60" cy="68" rx="12" ry="14" fill={p.light} opacity=".4" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${52 + i * 8} 62 q-3 4 0 8`} stroke={p.dark} strokeWidth="1.2" fill="none" />)}
      <path d="M40 54 C28 56 24 72 30 80 C38 76 42 66 42 58Z" fill={p.dark} /><path d="M80 54 C92 56 96 72 90 80 C82 76 78 66 78 58Z" fill={p.dark} />
      <path d="M44 38 L40 24 L52 34Z M76 38 L80 24 L68 34Z" fill={p.main} />
      <circle cx="51" cy="44" r="9" fill={hsl(p.h, 40, 82)} /><circle cx="69" cy="44" r="9" fill={hsl(p.h, 40, 82)} />
      <Eye x={51} y={44} r={5} c={hsl(46, 100, 56)} /><Eye x={69} y={44} r={5} c={hsl(46, 100, 56)} />
      <path d="M56 50 L60 58 L64 50Z" fill={hsl(36, 90, 58)} />
      <path d="M52 34 L48 40 L56 38 L52 46" fill="none" stroke={hsl(55, 100, 88)} strokeWidth="1.2" opacity=".0" />
    </g>
  );
}

function Serpent({ p, trait, id }: { p: P; trait?: string; id: string }) {
  const body = "M8 80 C24 54 40 92 58 70 S92 40 84 30 S76 20 90 24";
  return (
    <g>
      <ellipse cx="60" cy="86" rx="40" ry="3" fill="#000" opacity=".3" />
      {trait === "wings" && <g>
        <path d="M64 56 C66 30 84 12 112 10 C102 18 100 28 104 36 C94 34 88 42 90 52 C82 46 74 50 70 60Z" fill={p.dark} /><path d="M64 56 C66 30 84 12 112 10" fill="none" stroke={p.light} strokeWidth=".9" opacity=".6" />
        <path d="M70 52 L100 22 M76 54 L98 38" stroke={p.light} strokeWidth=".7" opacity=".45" />
      </g>}
      <path d={body} fill="none" stroke={p.deep} strokeWidth="14" strokeLinecap="round" />
      <path d={body} fill="none" stroke={`url(#${id}-body)`} strokeWidth="11" strokeLinecap="round" />
      <path d={body} fill="none" stroke={p.light} strokeWidth="3.5" strokeLinecap="round" opacity=".28" strokeDasharray="2 6" />
      {trait === "moss" && [[20, 66], [32, 74], [48, 76], [60, 68], [74, 56], [82, 42]].map(([x, y], i) => <g key={i} fill={hsl(105, 60, 38)}><circle cx={x} cy={y - 6} r="4" /><circle cx={x + 3} cy={y - 8} r="3" fill={hsl(90, 60, 52)} /></g>)}
      {trait === "wings" && [[22, 66], [36, 78], [50, 78], [62, 66], [74, 54]].map(([x, y], i) => <path key={i} d={`M${x - 3} ${y - 6} L${x} ${y - 13} L${x + 3} ${y - 6}Z`} fill={p.light} opacity=".85" />)}
      <g transform="translate(90 24)">
        <ellipse cx="2" cy="0" rx="10" ry="7.5" fill={p.main} />
        <path d="M8 -2 L20 2 L8 6Z" fill={p.dark} /><path d="M-2 -5 L-8 -15 L2 -8Z M4 -6 L6 -16 L9 -6Z" fill={trait === "wings" ? p.light : p.dark} />
        <Eye x={4} y={-2} r={2} c={hsl(48, 100, 58)} />
        {trait === "wings" && <circle cx="2" cy="0" r="16" fill={hsl(p.h, 90, 85)} opacity=".12" />}
      </g>
    </g>
  );
}

function Golem({ p, trait, id }: { p: P; trait?: string; id: string }) {
  const fur = trait === "fur", steam = trait === "steam", crest = trait === "crest";
  const body = fur ? hsl(200, 40, 90) : p.main;
  return (
    <g>
      <ellipse cx="60" cy="86" rx="28" ry="3.5" fill="#000" opacity=".35" />
      <rect x="40" y="68" width="14" height="18" rx="4" fill={p.deep} /><rect x="66" y="68" width="14" height="18" rx="4" fill={p.deep} />
      <rect x="22" y="40" width="14" height="32" rx="6" fill={p.dark} /><rect x="84" y="40" width="14" height="32" rx="6" fill={p.dark} />
      <rect x="32" y="38" width="56" height="38" rx="9" fill={fur ? `url(#${id}-fur)` : `url(#${id}-body)`} />
      {fur && <path d="M32 50 l-4 4 4 4 -4 4 4 4 -4 4 M88 50 l4 4 -4 4 4 4 -4 4 4 4" stroke={hsl(200, 30, 70)} strokeWidth="1.4" fill="none" />}
      {!fur && <g stroke={p.deep} strokeWidth="1" opacity=".55" fill="none"><path d="M32 54 H88 M52 38 V54 M70 54 V76" /><path d="M40 44 l5 3 M78 62 l6 3" /></g>}
      <circle cx="60" cy="58" r="6" fill={p.glow} opacity=".9" /><circle cx="60" cy="58" r="10" fill={p.glow} opacity=".22" />
      <rect x="40" y="16" width="40" height="26" rx="8" fill={fur ? `url(#${id}-fur)` : `url(#${id}-body)`} stroke={p.deep} strokeWidth=".8" />
      {fur && <><path d="M42 20 L32 6 L46 14Z M78 20 L88 6 L74 14Z" fill={hsl(40, 30, 88)} /><rect x="46" y="30" width="28" height="10" rx="4" fill={hsl(200, 25, 75)} /></>}
      <rect x="46" y="24" width="10" height="5" rx="2.5" fill={p.deep} /><rect x="64" y="24" width="10" height="5" rx="2.5" fill={p.deep} />
      <circle cx="51" cy="26.5" r="2.2" fill={fur ? hsl(200, 100, 70) : p.glow} /><circle cx="69" cy="26.5" r="2.2" fill={fur ? hsl(200, 100, 70) : p.glow} />
      {steam && <g>
        <path d="M46 16 H74 L72 4 H48Z" fill={hsl(32, 40, 90)} /><path d="M74 8 q8 1 6 7 q-2 3 -7 2" stroke={hsl(32, 40, 82)} strokeWidth="2" fill="none" />
        <ellipse cx="60" cy="5" rx="12" ry="2" fill={hsl(24, 70, 22)} />
        {[54, 62, 68].map((x, i) => <path key={x} d={`M${x} 2 q-5 -6 0 -11 q5 -5 0 -10`} fill="none" stroke="#fff" strokeWidth="1.6" opacity={0.5 - i * 0.1} strokeLinecap="round" />)}
      </g>}
      {crest && <g><path d="M60 16 C56 8 62 2 66 -2 C68 6 66 12 60 16Z" fill={hsl(8, 70, 52)} /><path d="M40 20 H80" stroke={hsl(44, 80, 62)} strokeWidth="2" /><path d="M88 52 L100 52 L100 70 L94 76 L88 70Z" fill={hsl(44, 70, 56)} stroke={hsl(40, 70, 30)} strokeWidth=".8" /></g>}
    </g>
  );
}

function Wisp({ p, trait, id }: { p: P; trait?: string; id: string }) {
  if (trait === "cabin") {
    return (
      <g>
        <path d="M-5 18 Q60 36 125 14" fill="none" stroke={hsl(30, 20, 14)} strokeWidth="1.4" />
        <path d="M60 28 V42" stroke={hsl(30, 20, 14)} strokeWidth="1.4" />
        <rect x="42" y="42" width="36" height="26" rx="6" fill={hsl(8, 70, 50)} stroke={hsl(8, 60, 22)} strokeWidth="1" /><rect x="42" y="42" width="36" height="9" rx="4" fill={hsl(8, 70, 62)} />
        {[48, 62].map((x) => <rect key={x} x={x} y="54" width="10" height="8" rx="2" fill={hsl(190, 80, 82)} />)}
        <circle cx="66" cy="58" r="3.3" fill={hsl(45, 100, 90)} /><Eye x={66} y={58} r={2.2} c={p.deep} />
        <circle cx="60" cy="56" r="26" fill={p.glow} opacity=".14" />
        {[34, 82].map((x, i) => <path key={x} d={`M${i ? 78 : 42} 58 q${i ? 12 : -12} -12 ${i ? 14 : -14} -22 q${i ? -10 : 10} 6 ${i ? -14 : 14} 22Z`} fill={hsl(190, 90, 80)} opacity=".75" />)}
      </g>
    );
  }
  if (trait === "thorn") {
    return (
      <g>
        <ellipse cx="60" cy="86" rx="22" ry="3" fill="#000" opacity=".35" />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d="M60 58 L57 30 L63 30Z" fill={i % 2 ? p.dark : p.main} transform={`rotate(${i * (360 / 14)} 60 58)`} />)}
        <circle cx="60" cy="58" r="20" fill={`url(#${id}-body)`} />
        <circle cx="60" cy="58" r="26" fill={hsl(300, 80, 70)} opacity=".12" />
        <Eye x={53} y={56} r={4.2} c={p.deep} /><Eye x={67} y={56} r={4.2} c={p.deep} />
        <path d="M54 68 Q60 72 66 68" stroke={p.deep} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M46 36 q-4 -10 2 -16 M74 36 q4 -10 -2 -16" stroke={hsl(130, 50, 52)} strokeWidth="2.4" fill="none" strokeLinecap="round" /><circle cx="48" cy="19" r="3.5" fill={hsl(310, 80, 66)} /><circle cx="72" cy="19" r="3.5" fill={hsl(310, 80, 66)} />
      </g>
    );
  }
  // lantern
  return (
    <g>
      <circle cx="60" cy="54" r="34" fill={p.glow} opacity=".16" /><circle cx="60" cy="54" r="22" fill={p.glow} opacity=".2" />
      <path d="M52 22 q8 -10 16 0" fill="none" stroke={hsl(40, 40, 28)} strokeWidth="2" />
      <path d="M48 28 H72 L76 36 H44Z" fill={hsl(40, 60, 34)} /><path d="M44 78 H76 L72 84 H48Z" fill={hsl(40, 60, 30)} />
      <path d="M44 36 H76 L72 78 H48Z" fill={`url(#${id}-lamp)`} stroke={hsl(40, 60, 40)} strokeWidth="1.6" />
      <path d="M60 36 V78 M52 36 L53 78 M68 36 L67 78" stroke={hsl(40, 60, 36)} strokeWidth=".8" opacity=".6" />
      <path d="M60 70 C50 64 54 52 60 46 C66 52 70 64 60 70Z" fill={hsl(46, 100, 88)} /><path d="M60 68 C54 63 57 55 60 51 C63 55 66 63 60 68Z" fill="#fff" opacity=".85" />
      <Eye x={56} y={60} r={1.6} c={p.deep} /><Eye x={65} y={60} r={1.6} c={p.deep} />
      {[[30, 40], [92, 36], [24, 66], [98, 68]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill={hsl(46, 100, 82)} opacity=".8" />)}
    </g>
  );
}

function Whale({ p, trait, id }: { p: P; trait?: string; id: string }) {
  const gears = trait === "gears";
  return (
    <g>
      {!gears && <>
        <path d="M-5 60 Q20 20 44 50 Q60 8 78 50 Q98 22 125 56 V100 H-5Z" fill={hsl(200, 70, 40)} opacity=".55" />
        <path d="M44 50 Q48 38 56 30 M78 50 Q82 38 88 30" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".7" />
      </>}
      <ellipse cx="60" cy="86" rx="40" ry="3.5" fill="#000" opacity=".3" />
      <path d="M10 58 C10 34 44 28 70 38 C92 46 98 58 112 40 C114 56 108 70 96 74 C108 78 118 76 118 76 C100 90 80 84 70 80 C50 84 14 80 10 58Z" fill={`url(#${id}-body)`} />
      <path d="M12 62 C30 76 60 80 90 72 C70 86 30 86 12 62Z" fill={p.light} opacity=".35" />
      <path d="M70 80 C74 90 84 92 92 90 C86 84 84 80 82 76Z" fill={p.dark} />
      <Eye x={28} y={54} r={2.6} c={p.deep} />
      {gears ? <>
        {[[52, 56, 11], [72, 62, 7], [38, 66, 5]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={r} fill={hsl(42, 70, 52)} stroke={hsl(36, 70, 26)} strokeWidth=".8" />
          {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-1.2} y={-r - 2} width="2.4" height="3" fill={hsl(42, 70, 46)} transform={`rotate(${k * 45})`} />)}
          <circle r={r * 0.35} fill={hsl(36, 70, 22)} />
        </g>)}
        {[24, 36].map((x) => <path key={x} d={`M${x} 40 q2 -8 0 -14`} stroke={hsl(42, 80, 80)} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".8" />)}
      </> : <>
        <path d="M46 34 q-2 -12 4 -20 M52 34 q4 -10 14 -12 M58 30 q-2 -10 6 -16" fill="none" stroke="#fff" strokeWidth="2" opacity=".75" strokeLinecap="round" />
        <path d="M20 30 L24 20 L28 30Z" fill="#fff" opacity=".5" />
      </>}
    </g>
  );
}

/** The hand-painted art of the six legends (David's paintings, cropped inside their frame; the card draws its own frame). */
export function PaintedArt({ id }: { id: string }) {
  return (
    <picture>
      <source srcSet={withBase(`/art/v3/games/${id}.avif`)} type="image/avif" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pk-art pk-painted" src={withBase(`/art/v3/games/${id}.webp`)} alt="" width={336} height={422} loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

export function CardArt({ art }: { art: Art }) {
  const id = useId().replace(/:/g, "");
  const p = palette(art.hue);
  const Body = { fox: Fox, bird: Bird, serpent: Serpent, golem: Golem, wisp: Wisp, whale: Whale }[art.kind];
  return (
    <svg viewBox="0 0 120 100" className="pk-art" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={p.light} /><stop offset=".35" stopColor={p.main} /><stop offset="1" stopColor={p.dark} /></linearGradient>
        <linearGradient id={`${id}-fur`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={hsl(200, 60, 96)} /><stop offset="1" stopColor={hsl(205, 35, 72)} /></linearGradient>
        <linearGradient id={`${id}-lamp`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={hsl(40, 100, 72, 0.9)} /><stop offset="1" stopColor={hsl(24, 90, 52, 0.85)} /></linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={hsl(14, 90, 46)} /><stop offset=".6" stopColor={hsl(34, 100, 58)} /><stop offset="1" stopColor={hsl(52, 100, 80)} /></linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .92  0 0 0 0 .8  0 0 0 .5 0" /></filter>
        <radialGradient id={`${id}-vig`} cx=".5" cy=".5" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></radialGradient>
      </defs>
      <Scene scene={art.scene} p={p} id={id} />
      <Body p={p} trait={art.trait} id={id} />
      <rect width="120" height="100" filter={`url(#${id}-grain)`} opacity=".16" />
      <rect width="120" height="100" fill={`url(#${id}-vig)`} />
    </svg>
  );
}
