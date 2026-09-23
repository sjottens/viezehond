type P = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const BagIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const CloseIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const ArrowIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const CheckIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
export const PlusIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M5 12h14" /></svg>
);
export const TruckIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
);
export const ShieldIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-4.5" /></svg>
);
export const ReturnIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg>
);
export const PawIcon = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="-20 -24 40 44" fill="currentColor" aria-hidden>
    <ellipse cx="0" cy="8" rx="13" ry="11" />
    <ellipse cx="-15" cy="-8" rx="5.5" ry="7" />
    <ellipse cx="-5" cy="-15" rx="5.5" ry="7" />
    <ellipse cx="6" cy="-15" rx="5.5" ry="7" />
    <ellipse cx="16" cy="-7" rx="5.5" ry="7" />
  </svg>
);
