"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { AUResidencyType, PayFrequency } from "@/lib/countries/types";

interface AUTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: AUResidencyType;
  onResidencyTypeChange: (value: AUResidencyType) => void;
  hasPrivateHealthInsurance: boolean;
  onPrivateHealthInsuranceChange: (value: boolean) => void;
}

export function AUTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  hasPrivateHealthInsurance,
  onPrivateHealthInsuranceChange,
}: AUTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={3}>
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      <SelectField
        id="residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Australian Resident" },
          { value: "non_resident", label: "Foreign Resident" },
        ]}
      />
      <BooleanSelectField
        id="private-health-insurance"
        label="Private Health Insurance"
        value={hasPrivateHealthInsurance}
        onChange={onPrivateHealthInsuranceChange}
        trueLabel="Yes (Hospital Cover)"
        falseLabel="No"
        trueFirst
      />
    </CalculatorFieldGrid>
  );
}
