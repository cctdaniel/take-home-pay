"use client";

import {
  CalculatorFieldGrid,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { USFilingStatus, PayFrequency } from "@/lib/countries/types";
import { getStateOptions } from "@/lib/countries/us/state-tax";

interface USTaxOptionsProps {
  state: string;
  onStateChange: (value: string) => void;
  filingStatus: USFilingStatus;
  onFilingStatusChange: (value: USFilingStatus) => void;
  numberOfQualifyingChildren: number;
  onNumberOfQualifyingChildrenChange: (value: number) => void;
  numberOfOtherDependents: number;
  onNumberOfOtherDependentsChange: (value: number) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

const stateOptions = getStateOptions();

// Group states by tax type for better UX
const noTaxStates = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
const popularStates = ["CA", "NY", "TX", "FL", "WA", "NJ", "MA", "IL", "PA", "GA", "NC", "CO", "AZ"];

export function USTaxOptions({
  state,
  onStateChange,
  filingStatus,
  onFilingStatusChange,
  numberOfQualifyingChildren,
  onNumberOfQualifyingChildrenChange,
  numberOfOtherDependents,
  onNumberOfOtherDependentsChange,
  payFrequency,
  onPayFrequencyChange,
}: USTaxOptionsProps) {
  // Sort states: popular first, then alphabetically
  const sortedStates = [...stateOptions].sort((a, b) => {
    const aPopular = popularStates.indexOf(a.code);
    const bPopular = popularStates.indexOf(b.code);

    if (aPopular !== -1 && bPopular !== -1) {
      return aPopular - bPopular;
    }
    if (aPopular !== -1) return -1;
    if (bPopular !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <CalculatorFieldGrid columns={3}>
      <SelectField
        id="state"
        label="State"
        value={state}
        onChange={onStateChange}
        options={sortedStates.map((s) => ({
          value: s.code,
          label: `${s.name}${noTaxStates.includes(s.code) ? " (No State Tax)" : ""}`,
        }))}
      />
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />

      <SelectField
        id="filing-status"
        label="Filing Status"
        value={filingStatus}
        onChange={onFilingStatusChange}
        options={[
          { value: "single", label: "Single" },
          { value: "married_jointly", label: "Married Filing Jointly" },
          { value: "married_separately", label: "Married Filing Separately" },
          { value: "head_of_household", label: "Head of Household" },
        ]}
      />

      <NumberStepperField
        id="us-qualifying-children"
        label="Qualifying Children"
        value={numberOfQualifyingChildren}
        onChange={(value) =>
          onNumberOfQualifyingChildrenChange(Math.max(0, Math.floor(value)))
        }
        min={0}
        max={10}
        description="Children under 17 modeled for the federal Child Tax Credit."
      />

      <NumberStepperField
        id="us-other-dependents"
        label="Other Dependents"
        value={numberOfOtherDependents}
        onChange={(value) =>
          onNumberOfOtherDependentsChange(Math.max(0, Math.floor(value)))
        }
        min={0}
        max={10}
        description="Modeled for the federal Credit for Other Dependents."
      />
    </CalculatorFieldGrid>
  );
}
