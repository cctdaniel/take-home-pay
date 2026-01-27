"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FilingStatus } from "@/lib/constants/tax-brackets-2025";
import type { PayFrequency } from "@/lib/tax-calculations/types";
import { getStateOptions } from "@/lib/tax-calculations/state-tax";

interface TaxOptionsProps {
  state: string;
  onStateChange: (value: string) => void;
  filingStatus: FilingStatus;
  onFilingStatusChange: (value: FilingStatus) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

const stateOptions = getStateOptions();

// Group states by tax type for better UX
const noTaxStates = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
const popularStates = ["CA", "NY", "TX", "FL", "WA", "NJ", "MA", "IL", "PA", "GA", "NC", "CO", "AZ"];

export function TaxOptions({
  state,
  onStateChange,
  filingStatus,
  onFilingStatusChange,
  payFrequency,
  onPayFrequencyChange,
}: TaxOptionsProps) {
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

      <div className="space-y-2">
        <Label htmlFor="filing-status">Filing Status</Label>
        <Select
          id="filing-status"
          value={filingStatus}
          onChange={(e) => onFilingStatusChange(e.target.value as FilingStatus)}
        >
          <option value="single">Single</option>
          <option value="married_jointly">Married Filing Jointly</option>
          <option value="married_separately">Married Filing Separately</option>
          <option value="head_of_household">Head of Household</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pay-frequency">Pay Frequency</Label>
        <Select
          id="pay-frequency"
          value={payFrequency}
          onChange={(e) => onPayFrequencyChange(e.target.value as PayFrequency)}
        >
          <option value="annual">Annual</option>
          <option value="monthly">Monthly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="weekly">Weekly</option>
        </Select>
      </div>
    </div>
  );
}
