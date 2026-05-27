"use client";

import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";

interface IDContributionOptionsProps {
  dplkContribution: number;
  onDplkContributionChange: (value: number) => void;
  dplkContributionLimit: number;
  zakatContribution: number;
  onZakatContributionChange: (value: number) => void;
  zakatContributionLimit: number;
}

export function IDContributionOptions({
  dplkContribution,
  onDplkContributionChange,
  dplkContributionLimit,
  zakatContribution,
  onZakatContributionChange,
  zakatContributionLimit,
}: IDContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Tax-Deductible Contributions
      </h3>

      <div className="space-y-4">
        <ContributionSlider
          label="DPLK Pension Contribution"
          value={Math.min(dplkContribution, dplkContributionLimit)}
          onChange={onDplkContributionChange}
          max={dplkContributionLimit}
          currency="IDR"
          step={1000000}
          description="Dana Pensiun Lembaga Keuangan contributions reduce taxable income and cash take-home when paid by the employee. No general annual statutory cap is modeled."
        />

        <ContributionSlider
          label="Approved Zakat"
          value={Math.min(zakatContribution, zakatContributionLimit)}
          onChange={onZakatContributionChange}
          max={zakatContributionLimit}
          currency="IDR"
          step={1000000}
          description="Zakat or mandatory religious donations paid through the employer to approved institutions reduce taxable income. No general annual statutory cap is modeled."
        />
      </div>

      <InfoPanel title="Tip" tone="positive">
        DPLK and approved zakat are modeled as employee cash outflows that also
        reduce taxable income for the annual PPh 21 calculation. The entries
        are limited to remaining modeled cash compensation so take-home cannot
        go below zero.
      </InfoPanel>
    </div>
  );
}
