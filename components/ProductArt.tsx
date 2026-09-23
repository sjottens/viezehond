// Illustraties voor producten zonder foto. Kiest een tekening op basis van de slug en categorie.

const INK = '#1a1523';
const METAL = '#e6eaf2';
// Geen geel: dat verdwijnt tegen de gele achtergrond van de kammen
const PALETTE = ['#ff7aa8', '#2b59ff', '#35c48a', '#ff8a3d', '#8b6cff'];

type Kind = 'comb' | 'dematting' | 'brush' | 'glove' | 'bottle' | 'spray' | 'towel' | 'robe' | 'clipper' | 'cup' | 'paw';

function kindFor(slug: string, category: string): Kind {
  const has = (...words: string[]) => words.some((w) => slug.includes(w));
  if (has('ontklit')) return 'dematting';
  if (has('handschoen')) return 'glove';
  if (has('borstel')) return 'brush';
  if (has('kam')) return 'comb';
  if (has('spray', 'droogshampoo')) return 'spray';
  if (has('shampoo', 'conditioner')) return 'bottle';
  if (has('jas', 'badjas')) return 'robe';
  if (has('handdoek')) return 'towel';
  if (has('knipper', 'schaar')) return 'clipper';
  if (has('poot', 'reiniger')) return 'cup';
  return ({ kammen: 'comb', shampoo: 'bottle', handdoeken: 'towel' } as Record<string, Kind>)[category] ?? 'paw';
}

function colorFor(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const line = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Paw({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx="0" cy="8" rx="13" ry="11" />
      <ellipse cx="-15" cy="-8" rx="5.5" ry="7" />
      <ellipse cx="-5" cy="-15" rx="5.5" ry="7" />
      <ellipse cx="6" cy="-15" rx="5.5" ry="7" />
      <ellipse cx="16" cy="-7" rx="5.5" ry="7" />
    </g>
  );
}

function Bubbles() {
  return (
    <g fill="#fff" stroke={INK} strokeWidth="3">
      <circle cx="158" cy="48" r="11" />
      <circle cx="172" cy="78" r="6" />
      <circle cx="146" cy="26" r="5" />
    </g>
  );
}

function Drawing({ kind, c }: { kind: Kind; c: string }) {
  switch (kind) {
    case 'comb':
      return (
        <g transform="rotate(-16 100 100)">
          {Array.from({ length: 9 }, (_, i) => <line key={`g${i}`} x1={42 + i * 8} y1="84" x2={42 + i * 8} y2="138" {...line} strokeWidth="5" />)}
          {Array.from({ length: 12 }, (_, i) => <line key={`f${i}`} x1={116 + i * 4.5} y1="84" x2={116 + i * 4.5} y2="130" {...line} strokeWidth="2.5" />)}
          <rect x="30" y="60" width="140" height="28" rx="9" fill={METAL} {...line} />
          <rect x="40" y="68" width="40" height="8" rx="4" fill={c} />
        </g>
      );
    case 'dematting':
      return (
        <g transform="rotate(-12 100 100)">
          <rect x="18" y="88" width="62" height="26" rx="13" fill={c} {...line} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${88 + i * 14} 84 q 10 22 0 46`} fill="none" {...line} strokeWidth="6" />
          ))}
          <rect x="74" y="72" width="104" height="22" rx="8" fill={METAL} {...line} />
        </g>
      );
    case 'brush':
      return (
        <g transform="rotate(14 100 100)">
          <rect x="86" y="108" width="28" height="80" rx="14" fill="#e3a15f" {...line} />
          <rect x="42" y="30" width="116" height="86" rx="22" fill={c} {...line} />
          <rect x="54" y="42" width="92" height="62" rx="12" fill="#fff" {...line} strokeWidth="4" />
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} cx={66 + (i % 6) * 13.5} cy={54 + Math.floor(i / 6) * 13} r="2.6" fill={INK} />
          ))}
        </g>
      );
    case 'glove':
      return (
        <g>
          <ellipse cx="54" cy="112" rx="15" ry="26" transform="rotate(-28 54 112)" fill={c} {...line} />
          <path d="M62 172 V88 Q62 42 104 42 Q146 42 146 88 V172 Z" fill={c} {...line} />
          <rect x="58" y="150" width="92" height="30" rx="8" fill={INK} />
          {Array.from({ length: 15 }, (_, i) => (
            <circle key={i} cx={80 + (i % 4) * 16 + (Math.floor(i / 4) % 2) * 8} cy={70 + Math.floor(i / 4) * 18} r="5" fill="#fff" stroke={INK} strokeWidth="2.5" />
          ))}
        </g>
      );
    case 'bottle':
      return (
        <g>
          <rect x="80" y="26" width="40" height="24" rx="6" fill={INK} />
          <rect x="88" y="48" width="24" height="16" fill="#fff" {...line} />
          <rect x="52" y="62" width="96" height="120" rx="26" fill={c} {...line} />
          <rect x="66" y="92" width="68" height="60" rx="10" fill="#fff" {...line} strokeWidth="4" />
          <Paw x={100} y={124} s={0.95} fill={c} />
          <Bubbles />
        </g>
      );
    case 'spray':
      return (
        <g>
          <path d="M94 58 q-8 20 2 30" fill="none" {...line} strokeWidth="7" />
          <rect x="76" y="34" width="54" height="26" rx="7" fill={INK} />
          <rect x="128" y="40" width="16" height="10" rx="3" fill={INK} />
          {[[156, 45], [166, 35], [168, 56], [178, 45]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill={INK} />)}
          <rect x="88" y="58" width="30" height="16" fill="#fff" {...line} />
          <rect x="62" y="72" width="82" height="110" rx="22" fill={c} {...line} />
          <rect x="74" y="100" width="58" height="52" rx="10" fill="#fff" {...line} strokeWidth="4" />
          <Paw x={103} y={128} s={0.8} fill={c} />
        </g>
      );
    case 'towel':
      return (
        <g>
          <rect x="30" y="122" width="140" height="44" rx="14" fill="#fff" {...line} />
          <rect x="30" y="122" width="140" height="44" rx="14" fill="none" {...line} />
          <rect x="40" y="86" width="120" height="40" rx="14" fill={c} {...line} />
          <rect x="52" y="50" width="96" height="40" rx="14" fill="#ffcf33" {...line} />
          {[62, 72, 128, 138].map((x) => <rect key={x} x={x} y="50" width="5" height="40" fill="#fff" />)}
          {[52, 64, 136, 148].map((x) => <rect key={x} x={x} y="86" width="5" height="40" fill="#fff" />)}
          <rect x="52" y="50" width="96" height="40" rx="14" fill="none" {...line} />
          <rect x="40" y="86" width="120" height="40" rx="14" fill="none" {...line} />
        </g>
      );
    case 'robe':
      return (
        <g>
          <path d="M100 36 v-8 q0 -12 12 -12" fill="none" {...line} strokeWidth="4" />
          <path d="M100 38 L46 70 H154 Z" fill="none" {...line} strokeWidth="4" />
          <path d="M56 70 H144 L154 172 Q100 186 46 172 Z" fill={c} {...line} />
          <path d="M70 70 Q100 118 130 70" fill="#fff" {...line} />
          <rect x="52" y="124" width="96" height="14" rx="7" fill="#ffcf33" {...line} strokeWidth="4" />
          <Paw x={100} y={158} s={0.55} fill="#fff" />
        </g>
      );
    case 'clipper':
      return (
        <g transform="rotate(-8 100 100)">
          <path d="M70 176 Q78 118 98 96" fill="none" stroke={INK} strokeWidth="24" strokeLinecap="round" />
          <path d="M130 176 Q122 118 102 96" fill="none" stroke={INK} strokeWidth="24" strokeLinecap="round" />
          <path d="M70 176 Q78 118 98 96" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" />
          <path d="M130 176 Q122 118 102 96" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" />
          <path d="M100 98 L78 44 Q100 22 122 44 Z" fill={METAL} {...line} />
          <path d="M100 96 V48" {...line} strokeWidth="3" />
          <circle cx="100" cy="98" r="9" fill="#ffcf33" {...line} strokeWidth="4" />
        </g>
      );
    case 'cup':
      return (
        <g>
          {[[34, 160, 10], [168, 150, 8], [48, 70, 6], [160, 60, 5]].map(([x, y, r]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#7a4a2a" />
          ))}
          <path d="M52 62 H148 L136 176 Q100 188 64 176 Z" fill={c} {...line} />
          <ellipse cx="100" cy="62" rx="48" ry="14" fill={INK} />
          <ellipse cx="100" cy="60" rx="38" ry="8" fill="#fff" />
          {[76, 88, 100, 112, 124].map((x) => <line key={x} x1={x} y1="56" x2={x} y2="64" stroke={INK} strokeWidth="3" strokeLinecap="round" />)}
          <Paw x={100} y={126} s={1.2} fill="#fff" />
        </g>
      );
    default:
      return <Paw x={100} y={105} s={3} fill={c} />;
  }
}

export function ProductArt({ slug, category, name }: { slug: string; category: string; name: string }) {
  const kind = kindFor(slug, category);
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={name} className="art-svg">
      <Drawing kind={kind} c={colorFor(slug)} />
    </svg>
  );
}
