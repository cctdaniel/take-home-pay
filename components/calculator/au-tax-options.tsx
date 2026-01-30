"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { AUResidencyType, PayFrequency } from "@/lib/countries/types";

interface AUTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: AUResidencyType;
  onResidencyTypeChange: (value: AUResidencyType) => void;
  hasPrivateHealthInsurance: boolean;
  onPrivateHealthInsuranceChange: (value: boolean) => void;
}

export function AUTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  hasPrivateHealthInsurance,
  onPrivateHealthInsuranceChange,
}: AUTaxOptionsProps) {
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
            onResidencyTypeChange(e.target.value as AUResidencyType)
          }
        >
          <option value="resident">Australian Resident</option>
          <option value="non_resident">Foreign Resident</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="private-health-insurance">Private Health Insurance</Label>
        <Select
          id="private-health-insurance"
          value={hasPrivateHealthInsurance ? "yes" : "no"}
          onChange={(e) =>
            onPrivateHealthInsuranceChange(e.target.value === "yes")
          }
        >
          <option value="yes">Yes (Hospital Cover)</option>
          <option value="no">No</option>
        </Select>
      </div>
    </div>
  );
}
