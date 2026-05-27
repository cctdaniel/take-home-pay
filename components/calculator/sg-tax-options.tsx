"use client";

import {
  CalculatorFieldGrid,
  NumberField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type {
  SGResidencyType,
  SGTaxResidencyType,
  PayFrequency,
} from "@/lib/countries/types";

interface SGTaxOptionsProps {
  taxResidency: SGTaxResidencyType;
  onTaxResidencyChange: (value: SGTaxResidencyType) => void;
  residencyType: SGResidencyType;
  onResidencyTypeChange: (value: SGResidencyType) => void;
  age: number;
  onAgeChange: (value: number) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function SGTaxOptions({
  taxResidency,
  onTaxResidencyChange,
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
        id="sg-tax-residency"
        label="Tax Residency"
        value={taxResidency}
        onChange={onTaxResidencyChange}
        options={[
          { value: "resident", label: "Tax resident" },
          { value: "non_resident", label: "Non-resident" },
        ]}
        description="Controls IRAS relief eligibility and the non-resident employment tax rule."
      />
      <SelectField
        id="sg-cpf-srs-status"
        label="CPF / SRS Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "citizen_pr", label: "Citizen / Permanent Resident" },
          { value: "foreigner", label: "Foreigner / no CPF" },
        ]}
        description="Controls CPF payroll contributions and the SRS contribution cap."
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
