"use client";

import {
  CalculatorFieldGrid,
  NumberField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { PayFrequency, PTResidencyType } from "@/lib/countries/types";

interface PTTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: PTResidencyType;
  onResidencyTypeChange: (value: PTResidencyType) => void;
  filingStatus: "single" | "married_jointly" | "married_separately";
  onFilingStatusChange: (value: "single" | "married_jointly" | "married_separately") => void;
  numberOfDependents: number;
  onNumberOfDependentsChange: (value: number) => void;
  age: number;
  onAgeChange: (value: number) => void;
}

export function PTTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  filingStatus,
  onFilingStatusChange,
  numberOfDependents,
  onNumberOfDependentsChange,
  age,
  onAgeChange,
}: PTTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={3}>
      <SelectField
        id="residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Portuguese Resident" },
          { value: "nhr_2", label: "NHR 2.0 (20% flat rate)" },
          { value: "non_resident", label: "Non-Resident (25% flat)" },
        ]}
        description={
          residencyType === "nhr_2"
            ? "NHR 2.0: 20% flat tax rate for new residents (10-year regime)"
            : undefined
        }
      />
      <NumberField
        id="pt-age"
        label="Age"
        value={age}
        onChange={onAgeChange}
        min={18}
        max={100}
        fallbackValue={30}
        description="PPR limits vary by age"
      />
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      <SelectField
        id="filing-status"
        label="Filing Status"
        value={filingStatus}
        onChange={onFilingStatusChange}
        options={[
          { value: "single", label: "Single" },
          { value: "married_jointly", label: "Married Filing Jointly (Aggregado)" },
          { value: "married_separately", label: "Married Filing Separately (Separado)" },
        ]}
        description={
          filingStatus === "married_jointly"
            ? "Joint filing divides income by 2 for tax calculation"
            : undefined
        }
      />
      <SelectField
        id="dependents"
        label="Number of Dependents"
        value={Math.min(numberOfDependents, 8).toString() as `${number}`}
        onChange={(nextValue) => onNumberOfDependentsChange(parseInt(nextValue, 10))}
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
        description="EUR 600 deduction per dependent (from tax assessed)"
      />
    </CalculatorFieldGrid>
  );
}
