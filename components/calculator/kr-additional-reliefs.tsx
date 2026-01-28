"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dependents" className="text-xs text-zinc-400">
              Dependents (spouse, parents)
            </Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              max="10"
              value={reliefs.numberOfDependents || 0}
              onChange={(e) => handleChange("numberOfDependents", parseInt(e.target.value) || 0)}
              className="h-9"
            />
            <p className="text-xs text-zinc-500">₩1,500,000 each</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="childrenUnder20" className="text-xs text-zinc-400">
              Children (under 20)
            </Label>
            <Input
              id="childrenUnder20"
              type="number"
              min="0"
              max="10"
              value={reliefs.numberOfChildrenUnder20 || 0}
              onChange={(e) => handleChange("numberOfChildrenUnder20", parseInt(e.target.value) || 0)}
              className="h-9"
            />
            <p className="text-xs text-zinc-500">₩1,500,000 each</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="childrenUnder7" className="text-xs text-zinc-400">
              Children (under 7)
            </Label>
            <Input
              id="childrenUnder7"
              type="number"
              min="0"
              max="10"
              value={reliefs.numberOfChildrenUnder7 || 0}
              onChange={(e) => handleChange("numberOfChildrenUnder7", parseInt(e.target.value) || 0)}
              className="h-9"
            />
            <p className="text-xs text-zinc-500">Additional ₩1,000,000 each</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Tax Credits (세액공제)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="childrenForCredit" className="text-xs text-zinc-400">
              Children for Tax Credit
            </Label>
            <Input
              id="childrenForCredit"
              type="number"
              min="0"
              max="10"
              value={reliefs.numberOfChildrenForCredit || 0}
              onChange={(e) => handleChange("numberOfChildrenForCredit", parseInt(e.target.value) || 0)}
              className="h-9"
            />
            <p className="text-xs text-zinc-500">₩150,000 (1st-2nd), ₩300,000 (3rd+)</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-1">Notes:</p>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>Basic deduction (₩1,500,000 for taxpayer) is automatically applied</li>
          <li>Children under 7 must also be counted in &quot;Children under 20&quot;</li>
          <li>Children for tax credit = children eligible for child tax credit</li>
        </ul>
      </div>
    </div>
  );
}
