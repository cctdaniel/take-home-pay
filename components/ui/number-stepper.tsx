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
    <div className={cn("flex items-center gap-2", className)} role="group">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={label ? `Decrease ${label}` : "Decrease value"}
        id={id ? `${id}-decrement` : undefined}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-700 text-base leading-none text-zinc-300 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        −
      </button>
      <span
        className="min-w-[2ch] text-center text-sm tabular-nums text-zinc-300"
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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-700 text-base leading-none text-zinc-300 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
