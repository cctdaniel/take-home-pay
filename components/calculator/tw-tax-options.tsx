"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { PayFrequency } from "@/lib/countries/types";

interface TWTaxOptionsProps {
  isMarried: boolean;
  onMarriedChange: (value: boolean) => void;
  hasDisability: boolean;
  onDisabilityChange: (value: boolean) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function TWTaxOptions({
  isMarried,
  onMarriedChange,
  hasDisability,
  onDisabilityChange,
  payFrequency,
  onPayFrequencyChange,
}: TWTaxOptionsProps) {
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
        <Label htmlFor="filing-status">Filing Status</Label>
        <Select
          id="filing-status"
          value={isMarried ? "married" : "single"}
          onChange={(e) => onMarriedChange(e.target.value === "married")}
        >
          <option value="single">Single</option>
          <option value="married">Married (Joint)</option>
        </Select>
        <p className="text-xs text-zinc-500">
          Flat deduction reducing taxable income. {isMarried ? "NT$272,000 for married joint filers" : "NT$136,000 for single filers"}.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="disability-status">Disability Status</Label>
        <Select
          id="disability-status"
          value={hasDisability ? "disabled" : "none"}
          onChange={(e) => onDisabilityChange(e.target.value === "disabled")}
        >
          <option value="none">No Disability</option>
          <option value="disabled">Person with Disability</option>
        </Select>
        {hasDisability && (
          <p className="text-xs text-zinc-500">
            Additional deduction: NT$227,000
          </p>
        )}
      </div>
    </div>
  );
}
