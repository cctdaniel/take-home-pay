"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getCurrencySymbol } from "@/lib/countries/currency";
import { formatCurrency, type CurrencyCode } from "@/lib/format";

interface ContributionSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  step?: number;
  description?: string;
  currency: CurrencyCode;
}

export function ContributionSlider({
  label,
  value,
  onChange,
  max,
  step = 100,
  description,
  currency,
}: ContributionSliderProps) {
  const isMaxed = value >= max;

  // Currency symbol for min label
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">{label}</Label>
          {description && (
            <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-300 tabular-nums min-w-[80px] text-right">
            {formatCurrency(value, currency)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Max</span>
            <Switch
              checked={isMaxed}
              onCheckedChange={(checked) => onChange(checked ? max : 0)}
            />
          </div>
        </div>
      </div>
      <Slider
        value={value}
        onChange={onChange}
        max={max}
        step={step}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{currencySymbol}0</span>
        <span>{formatCurrency(max, currency)} limit</span>
      </div>
    </div>
  );
}
