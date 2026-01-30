"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { THResidencyType, PayFrequency } from "@/lib/countries/types";

interface THTaxOptionsProps {
  residencyType: THResidencyType;
  onResidencyTypeChange: (value: THResidencyType) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function THTaxOptions({
  residencyType,
  onResidencyTypeChange,
  payFrequency,
  onPayFrequencyChange,
}: THTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="residency-type">Residency Status</Label>
        <Select
          id="residency-type"
          value={residencyType}
          onChange={(e) => onResidencyTypeChange(e.target.value as THResidencyType)}
        >
          <option value="resident">Resident</option>
          <option value="non_resident">Non-Resident</option>
        </Select>
        <p className="text-xs text-zinc-500">
          Residents pay tax on worldwide income; non-residents only on Thai-sourced income
        </p>
      </div>

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
    </div>
  );
}
