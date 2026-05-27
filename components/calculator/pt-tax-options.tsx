"use client";

import {
  CalculatorFieldGrid,
  NumberField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type {
  PayFrequency,
  PTIrsJovemYear,
  PTResidencyType,
} from "@/lib/countries/types";

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
  irsJovemYear: PTIrsJovemYear;
  onIrsJovemYearChange: (value: PTIrsJovemYear) => void;
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
  irsJovemYear,
  onIrsJovemYearChange,
}: PTTaxOptionsProps) {
  const canUseIrsJovem = residencyType === "resident";

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
      <SelectField
        id="pt-irs-jovem"
        label="IRS Jovem"
        value={irsJovemYear}
        onChange={onIrsJovemYearChange}
        options={[
          { value: "none", label: "Not applying IRS Jovem" },
          {
            value: "year_1",
            label: "Year 1 (100% exemption)",
            disabled: !canUseIrsJovem,
          },
          {
            value: "years_2_to_4",
            label: "Years 2-4 (75% exemption)",
            disabled: !canUseIrsJovem,
          },
          {
            value: "years_5_to_7",
            label: "Years 5-7 (50% exemption)",
            disabled: !canUseIrsJovem,
          },
          {
            value: "years_8_to_10",
            label: "Years 8-10 (25% exemption)",
            disabled: !canUseIrsJovem,
          },
        ]}
        description={
          canUseIrsJovem
            ? "Portugal youth employment-income exemption, capped annually"
            : "IRS Jovem is modeled only for ordinary Portuguese residents"
        }
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
      <NumberStepperField
        id="dependents"
        label="Number of Dependents"
        value={numberOfDependents}
        onChange={onNumberOfDependentsChange}
        min={0}
        max={8}
        description="EUR 600 deduction per dependent (from tax assessed)"
      />
    </CalculatorFieldGrid>
  );
}
