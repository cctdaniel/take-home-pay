"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
  type SelectOption,
} from "@/components/calculator/calculator-fields";
import type { GRResidencyType, GRTaxRegime } from "@/lib/countries/gr/types";
import type { CurrencyCode, PayFrequency } from "@/lib/countries/types";

const TAX_REGIME_OPTIONS: SelectOption<GRTaxRegime>[] = [
  { value: "ordinary", label: "Ordinary employment taxation" },
  {
    value: "article_5c_new_resident",
    label: "Article 5C new tax resident",
  },
];

interface GRTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  taxRegime: GRTaxRegime;
  onTaxRegimeChange: (value: GRTaxRegime) => void;
  residencyType: GRResidencyType;
  onResidencyTypeChange: (value: GRResidencyType) => void;
  age: number;
  onAgeChange: (value: number) => void;
  numberOfDependents: number;
  onNumberOfDependentsChange: (value: number) => void;
  taxableBenefitsInKind?: number;
  onTaxableBenefitsInKindChange?: (value: number) => void;
  currency?: CurrencyCode;
}

export function GRTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  taxRegime,
  onTaxRegimeChange,
  residencyType,
  onResidencyTypeChange,
  age,
  onAgeChange,
  numberOfDependents,
  onNumberOfDependentsChange,
  taxableBenefitsInKind,
  onTaxableBenefitsInKindChange,
  currency,
}: GRTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={4}>
      <SelectField
        id="gr-tax-regime"
        label="Tax Regime"
        value={taxRegime}
        onChange={onTaxRegimeChange}
        options={TAX_REGIME_OPTIONS}
        description={
          taxRegime === "article_5c_new_resident"
            ? "Models the Article 5C 50% employment-income exemption for eligible new Greek tax residents"
            : "General employment taxation"
        }
      />
      <SelectField
        id="gr-residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Greek Tax Resident" },
          {
            value: "non_resident",
            label: "Non-Resident",
            disabled: taxRegime === "article_5c_new_resident",
          },
        ]}
        description={
          taxRegime === "article_5c_new_resident"
            ? "Article 5C requires a transfer of tax residence to Greece"
            : residencyType === "non_resident"
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
      <NumberStepperField
        id="gr-dependents"
        label="Dependent Children"
        value={numberOfDependents}
        onChange={onNumberOfDependentsChange}
        min={0}
        max={8}
        description="Adjusts 2026 tax rates and employment tax reduction"
      />
      <PayFrequencyField
        id="gr-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />
      {onTaxableBenefitsInKindChange && currency && (
        <CurrencyAmountField
          id="gr-taxable-benefits-in-kind"
          label="Taxable Benefits in Kind"
          value={taxableBenefitsInKind ?? 0}
          onChange={onTaxableBenefitsInKindChange}
          currency={currency}
          step={100}
          description="Annual taxable benefit value after exemptions. It increases income-tax and e-EFKA bases but is not cash salary."
        />
      )}
    </CalculatorFieldGrid>
  );
}
