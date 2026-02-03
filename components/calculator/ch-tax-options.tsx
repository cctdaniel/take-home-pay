// ============================================================================
// SWITZERLAND TAX OPTIONS
// ============================================================================

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Select } from "@/components/ui/select";
import { CH_CANTONAL_PROFILES } from "@/lib/countries/ch/constants/tax-brackets-2026";
import type { CHFilingStatus } from "@/lib/countries/ch/constants/tax-brackets-2026";
import type { PayFrequency } from "@/lib/countries/types";

interface CHTaxOptionsProps {
  filingStatus: CHFilingStatus;
  onFilingStatusChange: (value: CHFilingStatus) => void;
  canton: string;
  onCantonChange: (value: string) => void;
  age: number;
  onAgeChange: (value: number) => void;
  numberOfChildren: number;
  onNumberOfChildrenChange: (value: number) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
}

export function CHTaxOptions({
  filingStatus,
  onFilingStatusChange,
  canton,
  onCantonChange,
  age,
  onAgeChange,
  numberOfChildren,
  onNumberOfChildrenChange,
  payFrequency,
  onPayFrequencyChange,
}: CHTaxOptionsProps) {
  return (
    <div className="space-y-4">
      {/* First Row: Canton, Pay Frequency, Filing Status (3 columns like US) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ch-canton">Canton</Label>
          <Select
            id="ch-canton"
            value={canton}
            onChange={(e) => onCantonChange(e.target.value)}
          >
            {CH_CANTONAL_PROFILES.map((profile) => (
              <option key={profile.code} value={profile.code}>
                {profile.name} ({profile.code})
              </option>
            ))}
          </Select>
          <p className="text-xs text-zinc-500">Cantonal taxes vary by location</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ch-pay-frequency">Pay Frequency</Label>
          <Select
            id="ch-pay-frequency"
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
          <Label htmlFor="ch-filing-status">Filing Status</Label>
          <Select
            id="ch-filing-status"
            value={filingStatus}
            onChange={(e) => onFilingStatusChange(e.target.value as CHFilingStatus)}
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="single_parent">Single Parent</option>
          </Select>
          <p className="text-xs text-zinc-500">Affects tax brackets</p>
        </div>
      </div>

      {/* Second Row: Age, Children (2 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ch-age">Age</Label>
          <Input
            id="ch-age"
            type="number"
            min={18}
            max={100}
            value={age}
            onChange={(e) => onAgeChange(parseInt(e.target.value) || 35)}
            className="bg-zinc-800 border-zinc-700"
          />
          <p className="text-xs text-zinc-500">BVG pension rates vary by age</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ch-children">Number of Children</Label>
          <NumberStepper
            id="ch-children"
            value={numberOfChildren}
            onChange={onNumberOfChildrenChange}
            min={0}
            max={10}
            label="children"
          />
          <p className="text-xs text-zinc-500">CHF 263 deduction per child</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-sm font-medium text-zinc-300 mb-2">BVG Contribution Rates by Age</p>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>Age 25-34: 7% (min 3.5% employee)</li>
          <li>Age 35-44: 10% (min 5% employee)</li>
          <li>Age 45-54: 15% (min 7.5% employee)</li>
          <li>Age 55-65/64: 18% (min 9% employee)</li>
        </ul>
      </div>
    </div>
  );
}
