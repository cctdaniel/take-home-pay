"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import type { HSACoverageType } from "@/lib/constants/contribution-limits";

interface ContributionSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  description?: string;
}

function ContributionSlider({
  label,
  value,
  onChange,
  max,
  description,
}: ContributionSliderProps) {
  const isMaxed = value >= max;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">{label}</Label>
          {description && (
            <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-300 tabular-nums min-w-[80px] text-right">
            {formatCurrency(value)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Max</span>
            <Switch
              checked={isMaxed}
              onCheckedChange={(checked) => onChange(checked ? max : 0)}
            />
          </div>
        </div>
      </div>
      <Slider
        value={value}
        onChange={onChange}
        max={max}
        step={100}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>$0</span>
        <span>{formatCurrency(max)} limit</span>
      </div>
    </div>
  );
}

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
      />

      <ContributionSlider
        label="Roth IRA Contribution"
        description="Post-tax (no tax benefit now)"
        value={rothIRA}
        onChange={onRothIRAChange}
        max={rothIRALimit}
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
      />
    </div>
  );
}
