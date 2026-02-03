"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { PayFrequency, UKResidencyType } from "@/lib/countries/types";

type UKRegion = "rest_of_uk" | "scotland";

interface UKTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: UKResidencyType;
  onResidencyTypeChange: (value: UKResidencyType) => void;
  region: UKRegion;
  onRegionChange: (value: UKRegion) => void;
}

export function UKTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  region,
  onRegionChange,
}: UKTaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="uk-region">Region</Label>
        <Select
          id="uk-region"
          value={region}
          onChange={(e) => onRegionChange(e.target.value as UKRegion)}
        >
          <option value="rest_of_uk">England, Wales &amp; Northern Ireland</option>
          <option value="scotland">Scotland</option>
        </Select>
        <p className="text-xs text-zinc-500">Scottish rates apply to non-savings income.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="uk-residency-type">Residency Status</Label>
        <Select
          id="uk-residency-type"
          value={residencyType}
          onChange={(e) => onResidencyTypeChange(e.target.value as UKResidencyType)}
        >
          <option value="resident">Resident</option>
          <option value="non_resident">Non-resident</option>
        </Select>
        <p className="text-xs text-zinc-500">
          Personal Allowance is applied only for residents in this calculator.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="uk-pay-frequency">Pay Frequency</Label>
        <Select
          id="uk-pay-frequency"
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
