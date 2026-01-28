"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SGResidencyType, PayFrequency } from "@/lib/countries/types";

interface SGTaxOptionsProps {
  residencyType: SGResidencyType;
  onResidencyTypeChange: (value: SGResidencyType) => void;
  age: number;
  onAgeChange: (value: number) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function SGTaxOptions({
  residencyType,
  onResidencyTypeChange,
  age,
  onAgeChange,
  payFrequency,
  onPayFrequencyChange,
}: SGTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="residency-type">Residency Status</Label>
        <Select
          id="residency-type"
          value={residencyType}
          onChange={(e) => onResidencyTypeChange(e.target.value as SGResidencyType)}
        >
          <option value="citizen_pr">Citizen / Permanent Resident</option>
          <option value="foreigner">Foreigner</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min={18}
          max={100}
          value={age}
          onChange={(e) => onAgeChange(parseInt(e.target.value) || 30)}
          className="bg-zinc-800 border-zinc-700"
        />
        <p className="text-xs text-zinc-500">CPF rates vary by age</p>
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
