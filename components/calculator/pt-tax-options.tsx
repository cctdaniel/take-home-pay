"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { PayFrequency } from "@/lib/countries/types";

interface PTTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: "resident" | "non_resident";
  onResidencyTypeChange: (value: "resident" | "non_resident") => void;
  maritalStatus: "single" | "married";
  onMaritalStatusChange: (value: "single" | "married") => void;
  numberOfDependents: number;
  onNumberOfDependentsChange: (value: number) => void;
  age: number;
  onAgeChange: (value: number) => void;
}

export function PTTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  maritalStatus,
  onMaritalStatusChange,
  numberOfDependents,
  onNumberOfDependentsChange,
  age,
  onAgeChange,
}: PTTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <Label htmlFor="residency-type">Residency Status</Label>
        <Select
          id="residency-type"
          value={residencyType}
          onChange={(e) =>
            onResidencyTypeChange(e.target.value as "resident" | "non_resident")
          }
        >
          <option value="resident">Portuguese Resident</option>
          <option value="non_resident">Non-Resident (25% flat)</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="marital-status">Marital Status</Label>
        <Select
          id="marital-status"
          value={maritalStatus}
          onChange={(e) =>
            onMaritalStatusChange(e.target.value as "single" | "married")
          }
        >
          <option value="single">Single</option>
          <option value="married">Married</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dependents">Number of Dependents</Label>
        <Select
          id="dependents"
          value={numberOfDependents.toString()}
          onChange={(e) => onNumberOfDependentsChange(parseInt(e.target.value, 10))}
        >
          <option value="0">None</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pt-age">Age</Label>
        <Input
          id="pt-age"
          type="number"
          min={18}
          max={100}
          value={age}
          onChange={(e) => onAgeChange(parseInt(e.target.value) || 30)}
          className="bg-zinc-800 border-zinc-700"
        />
        <p className="text-xs text-zinc-500">PPR limits vary by age</p>
      </div>
    </div>
  );
}
