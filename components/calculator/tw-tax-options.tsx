"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { PayFrequency } from "@/lib/countries/types";

interface TWTaxOptionsProps {
  isMarried: boolean;
  onMarriedChange: (value: boolean) => void;
  hasDisability: boolean;
  onDisabilityChange: (value: boolean) => void;
  isGoldCardHolder: boolean;
  onGoldCardChange: (value: boolean) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function TWTaxOptions({
  isMarried,
  onMarriedChange,
  hasDisability,
  onDisabilityChange,
  isGoldCardHolder,
  onGoldCardChange,
  payFrequency,
  onPayFrequencyChange,
}: TWTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={3}>
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      <SelectField
        id="filing-status"
        label="Filing Status"
        value={isMarried ? "married" : "single"}
        onChange={(nextValue) => onMarriedChange(nextValue === "married")}
        options={[
          { value: "single", label: "Single" },
          { value: "married", label: "Married (Joint)" },
        ]}
        description={`Flat deduction reducing taxable income. ${
          isMarried
            ? "NT$272,000 for married joint filers"
            : "NT$136,000 for single filers"
        }.`}
      />
      <BooleanSelectField
        id="disability-status"
        label="Disability Status"
        value={hasDisability}
        onChange={onDisabilityChange}
        trueLabel="Person with Disability"
        falseLabel="No Disability"
        description={hasDisability ? "Additional deduction: NT$227,000" : undefined}
      />
      <BooleanSelectField
        id="gold-card-status"
        label="Employment Gold Card"
        value={isGoldCardHolder}
        onChange={onGoldCardChange}
        trueLabel="Gold Card Holder (50% exemption on income > NT$3M)"
        falseLabel="Regular Taxpayer"
        description={
          isGoldCardHolder
            ? "50% of income above NT$3M is tax-exempt for first 5 years as tax resident"
            : undefined
        }
      />
    </CalculatorFieldGrid>
  );
}
