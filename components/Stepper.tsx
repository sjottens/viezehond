'use client';
import { MinusIcon, PlusIcon } from './icons';

type Props = { value: number; max: number; min?: number; onChange: (n: number) => void; label: string };

export function Stepper({ value, max, min = 0, onChange, label }: Props) {
  return (
    <div className="stepper" role="group" aria-label={`Aantal ${label}`}>
      <button type="button" aria-label="Eén minder" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <MinusIcon />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Eén meer" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <PlusIcon />
      </button>
    </div>
  );
}
