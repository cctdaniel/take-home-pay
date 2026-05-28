"use client";

import {
  CalculatorFieldGrid,
  CountStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { Switch } from "@/components/ui/switch";
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

      <CountStepperField
        spanColumns={3}
        id="id-dependents"
        label="Number of Dependents"
        value={numberOfDependents}
        onChange={onNumberOfDependentsChange}
        max={3}
        description="PTKP adds Rp4.500.000 per dependent (max 3)."
      />

      <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-3 sm:col-span-2 lg:col-span-3">
        <div>
          <p className="text-sm text-zinc-200">Spouse income combined</p>
          <p className="text-xs text-zinc-500">
            Adds Rp54.000.000 PTKP when spouse income is combined.
          </p>
        </div>
        <Switch
          checked={isMarried && spouseIncomeCombined}
          onCheckedChange={(value) => onSpouseIncomeCombinedChange(Boolean(value))}
          disabled={!isMarried}
        />
      </div>
    </CalculatorFieldGrid>
  );
}
