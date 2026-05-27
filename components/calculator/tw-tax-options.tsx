"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { PayFrequency } from "@/lib/countries/types";
import type { TWTaxResidencyType } from "@/lib/countries/types";

interface TWTaxOptionsProps {
  taxResidency: TWTaxResidencyType;
  onTaxResidencyChange: (value: TWTaxResidencyType) => void;
  isMarried: boolean;
  onMarriedChange: (value: boolean) => void;
  isGoldCardHolder: boolean;
  onGoldCardChange: (value: boolean) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function TWTaxOptions({
  taxResidency,
  onTaxResidencyChange,
  isMarried,
  onMarriedChange,
  isGoldCardHolder,
  onGoldCardChange,
  payFrequency,
  onPayFrequencyChange,
}: TWTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={3}>
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      <SelectField
        id="tw-tax-residency"
        label="Tax Residency"
        value={taxResidency}
        onChange={onTaxResidencyChange}
        options={[
          { value: "resident", label: "Resident (183+ days)" },
          { value: "non_resident", label: "Non-resident" },
        ]}
        description={
          taxResidency === "resident"
            ? "Resident aliens use progressive rates and resident deductions."
            : "Non-resident salary is modeled at the 18% salary withholding rate with no resident deductions."
        }
      />
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
        id="gold-card-status"
        label="Employment Gold Card"
        value={isGoldCardHolder}
        onChange={onGoldCardChange}
        trueLabel="Gold Card Holder (50% exemption on income > NT$3M)"
        falseLabel="Regular Taxpayer"
        className={taxResidency === "non_resident" ? "opacity-50" : undefined}
        description={
          taxResidency === "non_resident"
            ? "Gold Card tax incentives require resident status."
            : isGoldCardHolder
            ? "50% of income above NT$3M is tax-exempt for first 5 years as tax resident"
            : undefined
        }
      />
    </CalculatorFieldGrid>
  );
}
