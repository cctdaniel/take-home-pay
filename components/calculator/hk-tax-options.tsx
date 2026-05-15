"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
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
    <CalculatorFieldGrid columns={2}>
      <SelectField
        id="hk-residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Resident" },
          { value: "non_resident", label: "Non-resident" },
        ]}
        description="Allowances are applied only for residents."
      />
      <PayFrequencyField
        id="hk-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />
    </CalculatorFieldGrid>
  );
}
