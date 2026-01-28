"use client";

import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import type { KRTaxReliefInputs } from "@/lib/countries/types";

interface KRAdditionalReliefsProps {
  reliefs: KRTaxReliefInputs;
  onChange: (reliefs: KRTaxReliefInputs) => void;
}

export function KRAdditionalReliefs({ reliefs, onChange }: KRAdditionalReliefsProps) {
  const handleChange = (field: keyof KRTaxReliefInputs, value: number) => {
    onChange({
      ...reliefs,
      [field]: Math.max(0, value),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Deductions (소득공제)</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Dependents (spouse, parents)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">₩1,500,000 each</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfDependents || 0}
              onChange={(value) => handleChange("numberOfDependents", value)}
              min={0}
              max={10}
              label="Dependents"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Total Children (under 20)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">₩1,500,000 deduction each</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfChildrenUnder20 || 0}
              onChange={(value) => handleChange("numberOfChildrenUnder20", value)}
              min={0}
              max={10}
              label="Children under 20"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Of which, under age 7</Label>
              <p className="text-xs text-zinc-500 mt-0.5">Extra ₩1,000,000 deduction each</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfChildrenUnder7 || 0}
              onChange={(value) => handleChange("numberOfChildrenUnder7", value)}
              min={0}
              max={reliefs.numberOfChildrenUnder20 || 0}
              label="Children under 7"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-2">Example: 2 children (ages 6 and 10)</p>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>→ Total Children = <span className="text-zinc-300">2</span> (both are under 20)</li>
          <li>→ Of which, under 7 = <span className="text-zinc-300">1</span> (only the 6-year-old)</li>
        </ul>
        <p className="text-xs text-zinc-500 mt-2">
          Child tax credit (₩150,000 for 1st-2nd, ₩300,000 for 3rd+) is automatically applied based on total children.
        </p>
      </div>
    </div>
  );
}
