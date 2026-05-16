"use client";

import {
  CalculatorFieldGrid,
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
      <SelectField
        id="gr-dependents"
        label="Dependent Children"
        value={Math.min(numberOfDependents, 8).toString() as `${number}`}
        onChange={(nextValue) =>
          onNumberOfDependentsChange(parseInt(nextValue, 10))
        }
        options={[
          { value: "0", label: "None" },
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8+" },
        ]}
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
