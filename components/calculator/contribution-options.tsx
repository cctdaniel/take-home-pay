"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { SelectField } from "@/components/calculator/calculator-fields";
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
  healthFsa: number;
  onHealthFsaChange: (value: number) => void;
  healthFsaLimit: number;
  dependentCareFsa: number;
  onDependentCareFsaChange: (value: number) => void;
  dependentCareFsaLimit: number;
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
  healthFsa,
  onHealthFsaChange,
  healthFsaLimit,
  dependentCareFsa,
  onDependentCareFsaChange,
  dependentCareFsaLimit,
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

      <SelectField
        id="hsa-coverage"
        label="HSA Coverage"
        value={hsaCoverageType}
        onChange={onHsaCoverageTypeChange}
        options={[
          { value: "self", label: "Self Only" },
          { value: "family", label: "Family" },
        ]}
        description="Pre-tax (reduces taxable income)"
      />

      <ContributionSlider
        label="HSA Contribution"
        description="Pre-tax if made through payroll; requires HSA eligibility."
        value={hsa}
        onChange={onHsaChange}
        max={hsaLimit}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Health FSA Contribution"
        description="Pre-tax health FSA salary reduction. If also using an HSA, treat this as limited-purpose or post-deductible FSA coverage."
        value={healthFsa}
        onChange={onHealthFsaChange}
        max={healthFsaLimit}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Dependent Care FSA"
        description="Pre-tax dependent care assistance exclusion from wages."
        value={dependentCareFsa}
        onChange={onDependentCareFsaChange}
        max={dependentCareFsaLimit}
        step={50}
        currency="USD"
      />
    </div>
  );
}
