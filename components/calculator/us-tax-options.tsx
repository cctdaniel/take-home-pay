"use client";

import {
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { USFilingStatus, PayFrequency } from "@/lib/countries/types";
import { getStateOptions } from "@/lib/countries/us/state-tax";

interface USTaxOptionsProps {
  state: string;
  onStateChange: (value: string) => void;
  filingStatus: USFilingStatus;
  onFilingStatusChange: (value: USFilingStatus) => void;
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Select
          id="state"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
        >
          <optgroup label="Popular States">
            {sortedStates
              .filter(s => popularStates.includes(s.code))
              .map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} {noTaxStates.includes(s.code) ? "(No State Tax)" : ""}
                </option>
              ))}
          </optgroup>
          <optgroup label="Other States">
            {sortedStates
              .filter(s => !popularStates.includes(s.code))
              .map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} {noTaxStates.includes(s.code) ? "(No State Tax)" : ""}
                </option>
              ))}
          </optgroup>
        </Select>
      </div>

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
    </div>
  );
}
