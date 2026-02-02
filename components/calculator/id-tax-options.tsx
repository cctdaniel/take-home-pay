import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="id-pay-frequency">Pay Frequency</Label>
        <Select
          id="id-pay-frequency"
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
        <Label htmlFor="id-marital-status">Marital Status</Label>
        <Select
          id="id-marital-status"
          value={maritalStatus}
          onChange={(e) => {
            const value = e.target.value as "single" | "married";
            onMaritalStatusChange(value);
            if (value === "single") {
              onSpouseIncomeCombinedChange(false);
            }
          }}
        >
          <option value="single">Single</option>
          <option value="married">Married</option>
        </Select>
        <p className="text-xs text-zinc-500">
          PTKP adds Rp4.500.000 for married taxpayers.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="id-dependents">Number of Dependents</Label>
        <Select
          id="id-dependents"
          value={Math.min(numberOfDependents, 3).toString()}
          onChange={(e) =>
            onNumberOfDependentsChange(
              Math.min(3, Math.max(0, parseInt(e.target.value, 10) || 0)),
            )
          }
        >
          <option value="0">None</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </Select>
        <p className="text-xs text-zinc-500">
          PTKP adds Rp4.500.000 per dependent (max 3).
        </p>
      </div>

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
    </div>
  );
}
