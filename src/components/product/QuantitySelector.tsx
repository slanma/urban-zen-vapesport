import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const QuantitySelector = ({ value, onChange, min = 1, max = 999, disabled }: Props) => {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="inline-flex items-stretch rounded-full border border-border bg-background overflow-hidden">
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Snížit množství"
        className="w-11 flex items-center justify-center hover:bg-muted disabled:opacity-40"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        disabled={disabled}
        className="w-12 text-center font-heading font-bold text-base bg-transparent border-0 focus:outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Množství"
      />
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Zvýšit množství"
        className="w-11 flex items-center justify-center hover:bg-muted disabled:opacity-40"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
