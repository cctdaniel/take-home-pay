"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
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
    <CalculatorFieldGrid columns={2}>
      <SelectField
        id="residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Resident" },
          { value: "non_resident", label: "Non-Resident" },
        ]}
        description="Residents pay tax on worldwide income; non-residents only on Thai-sourced income"
      />
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
    </CalculatorFieldGrid>
  );
}
