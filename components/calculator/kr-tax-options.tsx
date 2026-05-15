"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { KRResidencyType, PayFrequency } from "@/lib/countries/types";

interface KRTaxOptionsProps {
  residencyType: KRResidencyType;
  onResidencyTypeChange: (value: KRResidencyType) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function KRTaxOptions({
  residencyType,
  onResidencyTypeChange,
  payFrequency,
  onPayFrequencyChange,
}: KRTaxOptionsProps) {
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
        description="Non-residents may be taxed at flat 19% rate"
      />
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
    </CalculatorFieldGrid>
  );
}
