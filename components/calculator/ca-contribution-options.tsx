"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";

interface CAContributionOptionsProps {
  rrspContribution: number;
  onRrspContributionChange: (value: number) => void;
  rrspLimit: number;
  currencyCode: "CAD";
}

export function CAContributionOptions({
  rrspContribution,
  onRrspContributionChange,
  rrspLimit,
  currencyCode,
}: CAContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <ContributionSlider
        label="RRSP Contribution"
        description={`Tax-deductible retirement contribution (max: C$${rrspLimit.toLocaleString()})`}
        value={rrspContribution}
        onChange={onRrspContributionChange}
        max={rrspLimit}
        currency={currencyCode}
      />
      <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
        <span className="text-emerald-400">Tip:</span> RRSP contributions reduce your taxable income.
        At top marginal rates (federal 33% + provincial), maxing out your RRSP can save over C$10,000/year in tax.
      </p>
    </div>
  );
}
