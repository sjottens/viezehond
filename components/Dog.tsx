// De mascotte: een blije, schone hond. Ligt onder de modder in de hero.
const INK = '#1a1523';
const s = { stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function Dog() {
  return (
    <svg viewBox="0 0 320 320" className="dog" aria-hidden="true">
      {/* oren */}
      <path d="M86 88 C42 90 26 168 50 204 C68 230 100 200 104 158 Z" fill="#b8652e" {...s} />
      <path d="M234 88 C278 90 294 168 270 204 C252 230 220 200 216 158 Z" fill="#b8652e" {...s} />
      {/* halsband */}
      <path d="M96 226 Q160 268 224 226 L230 246 Q160 292 90 246 Z" fill="#2b59ff" {...s} />
      <circle cx="160" cy="270" r="13" fill="#ffcf33" {...s} strokeWidth="5" />
      {/* hoofd */}
      <ellipse cx="160" cy="148" rx="90" ry="86" fill="#f4bf73" {...s} />
      <ellipse cx="124" cy="134" rx="27" ry="25" fill="#d98a4a" />
      {/* snuit */}
      <ellipse cx="160" cy="194" rx="54" ry="40" fill="#fff4e2" {...s} />
      {/* ogen */}
      <circle cx="124" cy="138" r="12" fill={INK} />
      <circle cx="196" cy="138" r="12" fill={INK} />
      <circle cx="128.5" cy="133.5" r="4.2" fill="#fff" />
      <circle cx="200.5" cy="133.5" r="4.2" fill="#fff" />
      <path d="M108 112 q14 -9 28 -2 M184 110 q14 -7 28 2" fill="none" {...s} strokeWidth="5" />
      {/* wangetjes */}
      <ellipse cx="104" cy="178" rx="13" ry="8" fill="#ff7aa8" opacity="0.55" />
      <ellipse cx="216" cy="178" rx="13" ry="8" fill="#ff7aa8" opacity="0.55" />
      {/* neus en bek */}
      <path d="M142 174 Q160 162 178 174 Q178 190 160 194 Q142 190 142 174 Z" fill={INK} />
      <ellipse cx="153" cy="173" rx="6" ry="3" fill="#fff" opacity="0.6" />
      <path d="M150 208 Q150 240 160 240 Q170 240 170 208 Z" fill="#ff7aa8" {...s} strokeWidth="4.5" />
      <path d="M160 214 V230" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M160 194 V206 M160 206 Q147 219 134 208 M160 206 Q173 219 186 208" fill="none" {...s} strokeWidth="5" />
    </svg>
  );
}
