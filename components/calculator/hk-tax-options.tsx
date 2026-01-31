"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { HKResidencyType, PayFrequency } from "@/lib/countries/types";

interface HKTaxOptionsProps {
  residencyType: HKResidencyType;
  onResidencyTypeChange: (value: HKResidencyType) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function HKTaxOptions({
  residencyType,
  onResidencyTypeChange,
  payFrequency,
  onPayFrequencyChange,
}: HKTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="hk-residency-type">Residency Status</Label>
        <Select
          id="hk-residency-type"
          value={residencyType}
          onChange={(e) => onResidencyTypeChange(e.target.value as HKResidencyType)}
        >
          <option value="resident">Resident</option>
          <option value="non_resident">Non-resident</option>
        </Select>
        <p className="text-xs text-zinc-500">
          Allowances are applied only for residents.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hk-pay-frequency">Pay Frequency</Label>
        <Select
          id="hk-pay-frequency"
          value={payFrequency}
          onChange={(e) => onPayFrequencyChange(e.target.value as PayFrequency)}
        >
          <option value="annual">Annual</option>
          <option value="monthly">Monthly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="weekly">Weekly</option>
        </Select>
      </div>
    </div>
  );
}
