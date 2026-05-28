"use client";

import {
  CalculatorFieldGrid,
  CountStepperField,
  NumberField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { InfoPanel } from "@/components/calculator/info-panel";
import { SPAIN_REGIONS } from "@/lib/countries/es/constants/tax-brackets-2026";
import type {
  ESEmploymentContractType,
  ESFilingStatus,
  ESResidencyType,
} from "@/lib/countries/es/types";
import type { PayFrequency } from "@/lib/countries/types";

interface ESTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: ESResidencyType;
  onResidencyTypeChange: (value: ESResidencyType) => void;
  region: string;
  onRegionChange: (value: string) => void;
  filingStatus: ESFilingStatus;
  onFilingStatusChange: (value: ESFilingStatus) => void;
  age: number;
  onAgeChange: (value: number) => void;
  numberOfChildren: number;
  onNumberOfChildrenChange: (value: number) => void;
  numberOfChildrenUnderThree: number;
  onNumberOfChildrenUnderThreeChange: (value: number) => void;
  employmentContractType: ESEmploymentContractType;
  onEmploymentContractTypeChange: (value: ESEmploymentContractType) => void;
}

export function ESTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  region,
  onRegionChange,
  filingStatus,
  onFilingStatusChange,
  age,
  onAgeChange,
  numberOfChildren,
  onNumberOfChildrenChange,
  numberOfChildrenUnderThree,
  onNumberOfChildrenUnderThreeChange,
  employmentContractType,
  onEmploymentContractTypeChange,
}: ESTaxOptionsProps) {
  return (
    <div className="space-y-4">
      <CalculatorFieldGrid columns={3}>
        <SelectField
          id="es-residency-type"
          label="Residency Status"
          value={residencyType}
          onChange={onResidencyTypeChange}
          options={[
            { value: "resident", label: "Spanish tax resident (IRPF)" },
            { value: "non_resident_eu_eea", label: "Non-resident EU/EEA (19% IRNR)" },
            { value: "non_resident_other", label: "Non-resident other (24% IRNR)" },
          ]}
        />
        <SelectField
          id="es-region"
          label="Autonomous Community"
          value={region}
          onChange={onRegionChange}
          options={SPAIN_REGIONS.map((regionOption) => ({
            value: regionOption.code,
            label: regionOption.name,
          }))}
          description={
            residencyType === "resident"
              ? "Applies the selected regional IRPF scale."
              : "Region is not used for non-resident IRNR."
          }
        />
        <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      </CalculatorFieldGrid>

      <CalculatorFieldGrid columns={3}>
        <SelectField
          id="es-filing-status"
          label="Filing Status"
          value={filingStatus}
          onChange={onFilingStatusChange}
          options={[
            { value: "individual", label: "Individual" },
            { value: "married_jointly", label: "Married joint return" },
            { value: "single_parent", label: "Single-parent joint return" },
          ]}
          description="Joint-return reductions are applied before the IRPF scale."
        />
        <NumberField
          id="es-age"
          label="Age"
          value={age}
          onChange={onAgeChange}
          min={18}
          max={100}
          fallbackValue={30}
          description="Personal minimum increases after age 65 and 75."
        />
        <SelectField
          id="es-contract-type"
          label="Contract Type"
          value={employmentContractType}
          onChange={onEmploymentContractTypeChange}
          options={[
            { value: "permanent", label: "Permanent / indefinite" },
            { value: "fixed_term", label: "Fixed-term" },
          ]}
          description="Affects the employee unemployment contribution rate."
        />
      </CalculatorFieldGrid>

      <CalculatorFieldGrid columns={2}>
        <CountStepperField
          spanColumns={2}
          id="es-children"
          label="Children / Descendants"
          value={numberOfChildren}
          onChange={(value) => {
            onNumberOfChildrenChange(value);
            if (numberOfChildrenUnderThree > value) {
              onNumberOfChildrenUnderThreeChange(value);
            }
          }}
          max={8}
          description="Uses the national descendant minimums."
        />
        <CountStepperField
          spanColumns={2}
          id="es-children-under-three"
          label="Children Under 3"
          value={numberOfChildrenUnderThree}
          onChange={onNumberOfChildrenUnderThreeChange}
          max={numberOfChildren}
          description="Adds EUR 2,800 to the descendant minimum per child."
        />
      </CalculatorFieldGrid>

      <InfoPanel title="Spain assumptions" tone="neutral">
        IRPF uses AEAT Renta 2025 state and autonomous scales as the latest
        official income-tax tables currently published. Social Security uses
        2026 employee contribution rates. Regional deductions, Basque/Navarre
        foral regimes, and personal itemized deductions are not modeled.
      </InfoPanel>
    </div>
  );
}
