"use client";

import {
  CalculatorFieldGrid,
  NumberField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
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
    <CalculatorFieldGrid columns={3}>
      <SelectField
        id="residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "citizen_pr", label: "Citizen / Permanent Resident" },
          { value: "foreigner", label: "Foreigner" },
        ]}
      />
      <NumberField
        id="age"
        label="Age"
        value={age}
        onChange={onAgeChange}
        min={18}
        max={100}
        fallbackValue={30}
        description="CPF rates vary by age"
      />
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
    </CalculatorFieldGrid>
  );
}
