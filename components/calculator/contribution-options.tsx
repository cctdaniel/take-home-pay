"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { HSACoverageType } from "@/lib/constants/contribution-limits";

interface ContributionOptionsProps {
  traditional401k: number;
  onTraditional401kChange: (value: number) => void;
  traditional401kLimit: number;
  rothIRA: number;
  onRothIRAChange: (value: number) => void;
  rothIRALimit: number;
  hsa: number;
  onHsaChange: (value: number) => void;
  hsaLimit: number;
  hsaCoverageType: HSACoverageType;
  onHsaCoverageTypeChange: (value: HSACoverageType) => void;
}

export function ContributionOptions({
  traditional401k,
  onTraditional401kChange,
  traditional401kLimit,
  rothIRA,
  onRothIRAChange,
  rothIRALimit,
  hsa,
  onHsaChange,
  hsaLimit,
  hsaCoverageType,
  onHsaCoverageTypeChange,
}: ContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Retirement & Savings Contributions
      </h3>

      <ContributionSlider
        label="401(k) Contribution"
        description="Pre-tax (reduces taxable income)"
        value={traditional401k}
        onChange={onTraditional401kChange}
        max={traditional401kLimit}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Roth IRA Contribution"
        description="Post-tax (no tax benefit now)"
        value={rothIRA}
        onChange={onRothIRAChange}
        max={rothIRALimit}
        step={50}
        currency="USD"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">HSA Coverage</Label>
            <p className="text-xs text-zinc-500 mt-0.5">Pre-tax (reduces taxable income)</p>
          </div>
          <Select
            value={hsaCoverageType}
            onChange={(e) => onHsaCoverageTypeChange(e.target.value as HSACoverageType)}
            className="w-32"
          >
            <option value="self">Self Only</option>
            <option value="family">Family</option>
          </Select>
        </div>
      </div>

      <ContributionSlider
        label="HSA Contribution"
        value={hsa}
        onChange={onHsaChange}
        max={hsaLimit}
        step={50}
        currency="USD"
      />
    </div>
  );
}
