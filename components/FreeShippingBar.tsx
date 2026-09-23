import { euro, FREE_SHIPPING_FROM_CENTS } from '@/lib/money';
import { TruckIcon } from './icons';

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const left = FREE_SHIPPING_FROM_CENTS - subtotal;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_FROM_CENTS) * 100));
  return (
    <div className={left <= 0 ? 'ship-bar done' : 'ship-bar'}>
      <p>
        <TruckIcon size={20} />
        {left <= 0 ? <strong>Je krijgt gratis verzending!</strong> : <span>Nog <strong>{euro(left)}</strong> tot gratis verzending</span>}
      </p>
      <div className="ship-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Voortgang naar gratis verzending">
        <div className="ship-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
