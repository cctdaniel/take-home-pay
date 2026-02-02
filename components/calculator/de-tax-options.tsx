"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
      {/* First row: State, Pay Frequency, Marital Status (similar to US) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="de-state">State (Bundesland)</Label>
          <Select
            id="de-state"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
          >
            {DE_FEDERAL_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({(s.churchTaxRate * 100).toFixed(0)}% church tax)
              </option>
            ))}
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

        <div className="space-y-2">
          <Label htmlFor="marital-status">Filing Status</Label>
          <Select
            id="marital-status"
            value={isMarried ? "married" : "single"}
            onChange={(e) => onMarriedChange(e.target.value === "married")}
          >
            <option value="single">Single (€20,350 Soli threshold)</option>
            <option value="married">Married (€40,700 Soli threshold)</option>
          </Select>
        </div>
      </div>

      {/* Second row: Church Membership, Children Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="church-member">Church Membership</Label>
          <Select
            id="church-member"
            value={isChurchMember ? "yes" : "no"}
            onChange={(e) => onChurchMemberChange(e.target.value === "yes")}
          >
            <option value="no">Not a member (no church tax)</option>
            <option value="yes">Member (8% or 9% of income tax)</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="childless">Children Status</Label>
          <Select
            id="childless"
            value={isChildless ? "yes" : "no"}
            onChange={(e) => onChildlessChange(e.target.value === "yes")}
          >
            <option value="no">Have children (1.7% Pflegeversicherung)</option>
            <option value="yes">Childless, age 23+ (2.5% Pflegeversicherung)</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
