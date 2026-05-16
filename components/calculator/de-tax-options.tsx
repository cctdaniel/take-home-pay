"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { DE_FEDERAL_STATES } from "@/lib/countries/de/config";
import type { PayFrequency } from "@/lib/countries/types";

interface DETaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  state: string;
  onStateChange: (value: string) => void;
  isMarried: boolean;
  onMarriedChange: (value: boolean) => void;
  isChurchMember: boolean;
  onChurchMemberChange: (value: boolean) => void;
  isChildless: boolean;
  onChildlessChange: (value: boolean) => void;
}

export function DETaxOptions({
  payFrequency,
  onPayFrequencyChange,
  state,
  onStateChange,
  isMarried,
  onMarriedChange,
  isChurchMember,
  onChurchMemberChange,
  isChildless,
  onChildlessChange,
}: DETaxOptionsProps) {
  return (
    <div className="space-y-4">
      <CalculatorFieldGrid columns={3}>
        <SelectField
          id="de-state"
          label="State (Bundesland)"
          value={state}
          onChange={onStateChange}
          options={DE_FEDERAL_STATES.map((s) => ({
            value: s.code,
            label: `${s.name} (${(s.churchTaxRate * 100).toFixed(0)}% church tax)`,
          }))}
        />
        <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
        <SelectField
          id="marital-status"
          label="Filing Status"
          value={isMarried ? "married" : "single"}
          onChange={(nextValue) => onMarriedChange(nextValue === "married")}
          options={[
            { value: "single", label: "Single (EUR 20,350 Soli threshold)" },
            { value: "married", label: "Married (EUR 40,700 Soli threshold)" },
          ]}
        />
      </CalculatorFieldGrid>

      <CalculatorFieldGrid columns={2}>
        <BooleanSelectField
          id="church-member"
          label="Church Membership"
          value={isChurchMember}
          onChange={onChurchMemberChange}
          trueLabel="Member (8% or 9% of income tax)"
          falseLabel="Not a member (no church tax)"
        />
        <BooleanSelectField
          id="childless"
          label="Children Status"
          value={isChildless}
          onChange={onChildlessChange}
          trueLabel="Childless, age 23+ (2.4% Pflegeversicherung)"
          falseLabel="Have children (1.8% Pflegeversicherung)"
        />
      </CalculatorFieldGrid>
    </div>
  );
}
