"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { HSACoverageType } from "@/lib/countries/us/contribution-limits";

export interface USContributionLimitsUI {
  traditional401k: number;
  roth401k: number;
  traditionalIRA: number;
  rothIRA: number;
  hsa: number;
  fsa: number;
  dependentCareFSA: number;
  commuterBenefits: number;
  studentLoanInterest: number;
}

interface ContributionOptionsProps {
  limits: USContributionLimitsUI;
  traditional401k: number;
  onTraditional401kChange: (value: number) => void;
  roth401k: number;
  onRoth401kChange: (value: number) => void;
  traditionalIRA: number;
  onTraditionalIRAChange: (value: number) => void;
  rothIRA: number;
  onRothIRAChange: (value: number) => void;
  hsa: number;
  onHsaChange: (value: number) => void;
  hsaCoverageType: HSACoverageType;
  onHsaCoverageTypeChange: (value: HSACoverageType) => void;
  fsa: number;
  onFsaChange: (value: number) => void;
  dependentCareFSA: number;
  onDependentCareFSAChange: (value: number) => void;
  commuterBenefits: number;
  onCommuterBenefitsChange: (value: number) => void;
  studentLoanInterest: number;
  onStudentLoanInterestChange: (value: number) => void;
}

export function ContributionOptions({
  limits,
  traditional401k,
  onTraditional401kChange,
  roth401k,
  onRoth401kChange,
  traditionalIRA,
  onTraditionalIRAChange,
  rothIRA,
  onRothIRAChange,
  hsa,
  onHsaChange,
  hsaCoverageType,
  onHsaCoverageTypeChange,
  fsa,
  onFsaChange,
  dependentCareFSA,
  onDependentCareFSAChange,
  commuterBenefits,
  onCommuterBenefitsChange,
  studentLoanInterest,
  onStudentLoanInterestChange,
}: ContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Retirement & Savings Contributions
      </h3>

      <ContributionSlider
        label="401(k) pre-tax"
        description="Shares annual elective deferral limit with Roth 401(k)"
        value={traditional401k}
        onChange={onTraditional401kChange}
        max={limits.traditional401k}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Roth 401(k)"
        description="Post-tax; shares elective deferral limit with pre-tax 401(k)"
        value={roth401k}
        onChange={onRoth401kChange}
        max={limits.roth401k}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Traditional IRA"
        description="Pre-tax when deductible (simplified model)"
        value={traditionalIRA}
        onChange={onTraditionalIRAChange}
        max={limits.traditionalIRA}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Roth IRA"
        description="Post-tax (no current-year federal tax benefit)"
        value={rothIRA}
        onChange={onRothIRAChange}
        max={limits.rothIRA}
        step={50}
        currency="USD"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">HSA coverage</Label>
            <p className="text-xs text-zinc-500 mt-0.5">Pre-tax health savings</p>
          </div>
          <Select
            value={hsaCoverageType}
            onChange={(e) =>
              onHsaCoverageTypeChange(e.target.value as HSACoverageType)
            }
            className="w-32"
          >
            <option value="self">Self only</option>
            <option value="family">Family</option>
          </Select>
        </div>
        <ContributionSlider
          label="HSA contribution"
          value={hsa}
          onChange={onHsaChange}
          max={limits.hsa}
          step={50}
          currency="USD"
        />
      </div>

      <ContributionSlider
        label="Health FSA"
        description="Pre-tax flexible spending (2026 IRS cap)"
        value={fsa}
        onChange={onFsaChange}
        max={limits.fsa}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Dependent Care FSA"
        description="Pre-tax child/elder care FSA"
        value={dependentCareFSA}
        onChange={onDependentCareFSAChange}
        max={limits.dependentCareFSA}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Commuter benefits"
        description="Pre-tax transit + parking (annualized monthly caps)"
        value={commuterBenefits}
        onChange={onCommuterBenefitsChange}
        max={limits.commuterBenefits}
        step={50}
        currency="USD"
      />

      <ContributionSlider
        label="Student loan interest"
        description="Above-the-line deduction (max $2,500)"
        value={studentLoanInterest}
        onChange={onStudentLoanInterestChange}
        max={limits.studentLoanInterest}
        step={50}
        currency="USD"
      />
    </div>
  );
}
