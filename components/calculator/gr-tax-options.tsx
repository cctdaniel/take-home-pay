"use client";

import {
  CalculatorFieldGrid,
  CountStepperField,
  NumberField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { GRResidencyType } from "@/lib/countries/gr/types";
import type { PayFrequency } from "@/lib/countries/types";

interface GRTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: GRResidencyType;
  onResidencyTypeChange: (value: GRResidencyType) => void;
  age: number;
  onAgeChange: (value: number) => void;
  numberOfDependents: number;
  onNumberOfDependentsChange: (value: number) => void;
}

export function GRTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  age,
  onAgeChange,
  numberOfDependents,
  onNumberOfDependentsChange,
}: GRTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={4}>
      <SelectField
        id="gr-residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Greek Tax Resident" },
          { value: "non_resident", label: "Non-Resident" },
        ]}
        description={
          residencyType === "non_resident"
            ? "Uses standard employment scale without resident tax reductions"
            : undefined
        }
      />
      <NumberField
        id="gr-age"
        label="Age"
        value={age}
        onChange={onAgeChange}
        min={16}
        max={100}
        fallbackValue={31}
        description="Youth rates apply up to age 30"
      />
      <CountStepperField
        spanColumns={3}
        id="gr-dependents"
        label="Dependent Children"
        value={numberOfDependents}
        onChange={onNumberOfDependentsChange}
        max={8}
        description="Adjusts 2026 tax rates and employment tax reduction"
      />
      <PayFrequencyField
        id="gr-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />
    </CalculatorFieldGrid>
  );
}
