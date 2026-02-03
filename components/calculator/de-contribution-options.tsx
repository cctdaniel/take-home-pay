"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";

interface DEContributionOptionsProps {
  occupationalPension: number;
  onOccupationalPensionChange: (value: number) => void;
  riesterContribution: number;
  onRiesterContributionChange: (value: number) => void;
  ruerupContribution: number;
  onRuerupContributionChange: (value: number) => void;
  limits: {
    bav: number;
    riester: number;
    ruerup: number;
  };
  isMarried: boolean;
}

export function DEContributionOptions({
  occupationalPension,
  onOccupationalPensionChange,
  riesterContribution,
  onRiesterContributionChange,
  ruerupContribution,
  onRuerupContributionChange,
  limits,
  isMarried,
}: DEContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <ContributionSlider
        label="Occupational Pension (bAV / Entgeltumwandlung)"
        description="Salary conversion is tax-free up to 8% of the BBG."
        value={occupationalPension}
        onChange={onOccupationalPensionChange}
        max={limits.bav}
        currency="EUR"
      />

      <ContributionSlider
        label="Riester Pension"
        description="Tax-deductible contributions up to EUR 2,100 per year (incl. allowances)."
        value={riesterContribution}
        onChange={onRiesterContributionChange}
        max={limits.riester}
        step={50}
        currency="EUR"
      />

      <ContributionSlider
        label="Ruerup (Basisrente)"
        description={`Tax-deductible cap for 2026: ${
          isMarried ? "EUR 61,652 (married)" : "EUR 30,826 (single)"
        }.`}
        value={ruerupContribution}
        onChange={onRuerupContributionChange}
        max={limits.ruerup}
        step={100}
        currency="EUR"
      />

      <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
        These inputs reduce taxable income in the calculator. Actual eligibility and
        deductibility can depend on your employment status, subsidies, and mandatory
        pension contributions.
      </p>
    </div>
  );
}
