"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { PayFrequency } from "@/lib/countries/types";

interface NLTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  hasThirtyPercentRuling: boolean;
  onThirtyPercentRulingChange: (value: boolean) => void;
}

export function NLTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  hasThirtyPercentRuling,
  onThirtyPercentRulingChange,
}: NLTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="space-y-2">
        <Label htmlFor="thirty-percent-ruling">30% Ruling</Label>
        <Select
          id="thirty-percent-ruling"
          value={hasThirtyPercentRuling ? "yes" : "no"}
          onChange={(e) => onThirtyPercentRulingChange(e.target.value === "yes")}
        >
          <option value="no">Not Applied</option>
          <option value="yes">Applied</option>
        </Select>
      </div>
      <div className="flex items-end text-xs text-zinc-500">
        Includes estimated general and labor tax credits for 2026.
      </div>
    </div>
  );
}
