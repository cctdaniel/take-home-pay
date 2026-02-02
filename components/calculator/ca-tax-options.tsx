"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CA_REGIONS } from "@/lib/countries/ca/constants/tax-brackets-2026";
import type { CARegion, PayFrequency } from "@/lib/countries/types";

interface CATaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  region: CARegion;
  onRegionChange: (value: CARegion) => void;
}

export function CATaxOptions({
  payFrequency,
  onPayFrequencyChange,
  region,
  onRegionChange,
}: CATaxOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="province">Province/Territory</Label>
        <Select
          id="province"
          value={region}
          onChange={(e) => onRegionChange(e.target.value as CARegion)}
        >
          {Object.values(CA_REGIONS).map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </Select>
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
