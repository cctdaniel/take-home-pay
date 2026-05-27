"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { PayFrequency } from "@/lib/countries/types";

interface IDTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  maritalStatus: "single" | "married";
  onMaritalStatusChange: (value: "single" | "married") => void;
  numberOfDependents: number;
  onNumberOfDependentsChange: (value: number) => void;
  spouseIncomeCombined: boolean;
  onSpouseIncomeCombinedChange: (value: boolean) => void;
}

export function IDTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  maritalStatus,
  onMaritalStatusChange,
  numberOfDependents,
  onNumberOfDependentsChange,
  spouseIncomeCombined,
  onSpouseIncomeCombinedChange,
}: IDTaxOptionsProps) {
  const isMarried = maritalStatus === "married";

  return (
    <CalculatorFieldGrid columns={3}>
      <PayFrequencyField
        id="id-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />

      <SelectField
        id="id-marital-status"
        label="Marital Status"
        value={maritalStatus}
        onChange={(value) => {
          onMaritalStatusChange(value);
          if (value === "single") {
            onSpouseIncomeCombinedChange(false);
          }
        }}
        options={[
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
        ]}
        description="PTKP adds Rp4.500.000 for married taxpayers."
      />

      <NumberStepperField
        id="id-dependents"
        label="Number of Dependents"
        value={numberOfDependents}
        onChange={onNumberOfDependentsChange}
        min={0}
        max={3}
        description="PTKP adds Rp4.500.000 per dependent (max 3)."
      />

      <BooleanSelectField
        id="id-spouse-income-combined"
        label="Spouse income combined"
        value={isMarried && spouseIncomeCombined}
        onChange={onSpouseIncomeCombinedChange}
        trueLabel="Combined"
        falseLabel="Not combined"
        disabled={!isMarried}
        description={
          isMarried
            ? "Adds Rp54.000.000 PTKP when spouse income is combined."
            : "Available only when marital status is married."
        }
        className="sm:col-span-2 lg:col-span-3"
      />
    </CalculatorFieldGrid>
  );
}
