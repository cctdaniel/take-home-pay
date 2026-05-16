"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import type { PayFrequency } from "@/lib/countries/types";

interface NLTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  hasThirtyPercentRuling: boolean;
  onThirtyPercentRulingChange: (value: boolean) => void;
  hasYoungChildren: boolean;
  onYoungChildrenChange: (value: boolean) => void;
}

export function NLTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  hasThirtyPercentRuling,
  onThirtyPercentRulingChange,
  hasYoungChildren,
  onYoungChildrenChange,
}: NLTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={4}>
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      <BooleanSelectField
        id="thirty-percent-ruling"
        label="30% Ruling"
        value={hasThirtyPercentRuling}
        onChange={onThirtyPercentRulingChange}
        trueLabel="Applied"
        falseLabel="Not Applied"
      />
      <BooleanSelectField
        id="young-children"
        label="Children Under 12"
        value={hasYoungChildren}
        onChange={onYoungChildrenChange}
        trueLabel="Yes (IACK eligible)"
        falseLabel="No"
      />
      <div className="flex items-end text-xs text-zinc-500">
        Includes general, labor, and IACK tax credits for 2026.
      </div>
    </CalculatorFieldGrid>
  );
}
