"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { PayFrequency } from "@/lib/countries/types";

interface NLTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function NLTaxOptions({ payFrequency, onPayFrequencyChange }: NLTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="pay-frequency">Pay Frequency</Label>
        <Select
          id="pay-frequency"
          value={payFrequency}
          onChange={(e) => onPayFrequencyChange(e.target.value as PayFrequency)}
        >
          <option value="annual">Annual</option>
          <option value="monthly">Monthly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="weekly">Weekly</option>
        </Select>
      </div>
      <div className="flex items-end text-xs text-zinc-500">
        Includes estimated general and labor tax credits for 2026.
      </div>
    </div>
  );
}
