"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/format";
import { formatCurrency } from "@/lib/format";
import type { PayFrequency } from "@/lib/countries/types";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

const PAY_FREQUENCY_OPTIONS: SelectOption<PayFrequency>[] = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
];

const GRID_COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

function parseNumberInput(value: string, fallbackValue: number): number {
  if (value.trim() === "") {
    return fallbackValue;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function clamp(value: number, min?: number, max?: number): number {
  const minClamped = min === undefined ? value : Math.max(min, value);
  return max === undefined ? minClamped : Math.min(max, minClamped);
}

export function CalculatorFieldGrid({
  children,
  columns = 3,
  className,
}: {
  children: ReactNode;
  columns?: keyof typeof GRID_COLUMNS;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", GRID_COLUMNS[columns], className)}>
      {children}
    </div>
  );
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  description,
  className,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Select>
      {description ? <p className="text-xs text-zinc-500">{description}</p> : null}
    </div>
  );
}

export function PayFrequencyField({
  value,
  onChange,
  id = "pay-frequency",
  className,
}: {
  value: PayFrequency;
  onChange: (value: PayFrequency) => void;
  id?: string;
  className?: string;
}) {
  return (
    <SelectField
      id={id}
      label="Pay Frequency"
      value={value}
      onChange={onChange}
      options={PAY_FREQUENCY_OPTIONS}
      className={className}
    />
  );
}

export function BooleanSelectField({
  id,
  label,
  value,
  onChange,
  trueLabel = "Yes",
  falseLabel = "No",
  trueFirst = false,
  description,
  className,
}: {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
  trueFirst?: boolean;
  description?: ReactNode;
  className?: string;
}) {
  const options: SelectOption<"yes" | "no">[] = trueFirst
    ? [
        { value: "yes", label: trueLabel },
        { value: "no", label: falseLabel },
      ]
    : [
        { value: "no", label: falseLabel },
        { value: "yes", label: trueLabel },
      ];

  return (
    <SelectField
      id={id}
      label={label}
      value={value ? "yes" : "no"}
      onChange={(nextValue) => onChange(nextValue === "yes")}
      options={options}
      description={description}
      className={className}
    />
  );
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  fallbackValue = value,
  description,
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  fallbackValue?: number;
  description?: ReactNode;
  className?: string;
}) {
  const [draftValue, setDraftValue] = useState(() => value.toString());
  const [isFocused, setIsFocused] = useState(false);

  const commitDraftValue = () => {
    const nextValue = clamp(parseNumberInput(draftValue, fallbackValue), min, max);
    setDraftValue(nextValue.toString());
    onChange(nextValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={isFocused ? draftValue : value}
        onFocus={(event) => {
          setDraftValue(event.currentTarget.value);
          setIsFocused(true);
        }}
        onChange={(event) => {
          const nextDraftValue = event.target.value;
          setDraftValue(nextDraftValue);

          if (nextDraftValue.trim() === "") {
            return;
          }

          const parsedValue = Number(nextDraftValue);
          if (Number.isFinite(parsedValue)) {
            onChange(parsedValue);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          commitDraftValue();
        }}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {description ? <p className="text-xs text-zinc-500">{description}</p> : null}
    </div>
  );
}

export function CurrencyAmountField({
  id,
  label,
  value,
  onChange,
  currency,
  min = 0,
  max,
  step = 1,
  placeholder = "0",
  description,
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency: CurrencyCode;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs tabular-nums text-zinc-500">
          {formatCurrency(value, currency)}
        </span>
      </div>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ""}
        onChange={(event) => onChange(clamp(parseNumberInput(event.target.value, min), min, max))}
        placeholder={placeholder}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {description ? <p className="text-xs text-zinc-500">{description}</p> : null}
    </div>
  );
}
