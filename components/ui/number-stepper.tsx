"use client";

import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  id?: string;
  className?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  id,
  className,
}: NumberStepperProps) {
  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + 1));
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={label ? `Decrease ${label}` : "Decrease value"}
        id={id ? `${id}-decrement` : undefined}
        className="w-8 h-8 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 flex items-center justify-center transition-colors"
      >
        -
      </button>
      <span
        className="w-8 text-center text-zinc-300 tabular-nums"
        aria-live="polite"
        aria-label={label ? `${label}: ${value}` : `Value: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={label ? `Increase ${label}` : "Increase value"}
        id={id ? `${id}-increment` : undefined}
        className="w-8 h-8 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  );
}
