import { euro, FREE_SHIPPING_FROM_CENTS } from '@/lib/money';
import { PawIcon } from './icons';

const ITEMS = [
  `Gratis verzending vanaf ${euro(FREE_SHIPPING_FROM_CENTS)}`,
  'Betalen met iDEAL, Bancontact of creditcard',
  '14 dagen bedenktijd',
  'Van modderpoot naar showhond',
  'Verzending naar Nederland en België',
];

export function Marquee() {
  const row = ITEMS.flatMap((t) => [<span key={t}>{t}</span>, <PawIcon key={`${t}-paw`} size={16} />]);
  return (
    <div className="marquee" aria-label={ITEMS.join('. ')}>
      <div className="marquee-track" aria-hidden="true">
        <div>{row}</div>
        <div>{row}</div>
      </div>
    </div>
  );
}
