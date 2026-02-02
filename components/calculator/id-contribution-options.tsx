"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IDContributionOptionsProps {
  dplkContribution: number;
  onDplkContributionChange: (value: number) => void;
  zakatContribution: number;
  onZakatContributionChange: (value: number) => void;
}

export function IDContributionOptions({
  dplkContribution,
  onDplkContributionChange,
  zakatContribution,
  onZakatContributionChange,
}: IDContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Tax-Deductible Contributions
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="id-dplk">DPLK Pension (Rp/year)</Label>
          <Input
            id="id-dplk"
            type="number"
            min={0}
            step={1000000}
            value={dplkContribution || ""}
            onChange={(e) => onDplkContributionChange(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <p className="text-xs text-zinc-500">
            Dana Pensiun Lembaga Keuangan contributions reduce taxable income.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="id-zakat">Zakat (Rp/year)</Label>
          <Input
            id="id-zakat"
            type="number"
            min={0}
            step={1000000}
            value={zakatContribution || ""}
            onChange={(e) => onZakatContributionChange(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <p className="text-xs text-zinc-500">
            Zakat paid to BAZNAS or authorized institutions reduces taxable income.
          </p>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400">Tip:</span> Both DPLK and Zakat 
          contributions are fully tax-deductible, reducing your taxable income 
          and lowering your PPh 21 tax.
        </p>
      </div>
    </div>
  );
}
