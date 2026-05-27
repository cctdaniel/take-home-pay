"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";

interface SGContributionOptionsProps {
  voluntaryCpfTopUp: number;
  onVoluntaryCpfTopUpChange: (value: number) => void;
  voluntaryCpfTopUpLimit: number;
  srsContribution: number;
  onSrsContributionChange: (value: number) => void;
  srsContributionLimit: number;
}

export function SGContributionOptions({
  voluntaryCpfTopUp,
  onVoluntaryCpfTopUpChange,
  voluntaryCpfTopUpLimit,
  srsContribution,
  onSrsContributionChange,
  srsContributionLimit,
}: SGContributionOptionsProps) {
  const showVoluntaryCpfTopUp = voluntaryCpfTopUpLimit > 0;
  const showSrsContribution = srsContributionLimit > 0;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Voluntary CPF and SRS Contributions
      </h3>

      {showVoluntaryCpfTopUp ? (
        <ContributionSlider
          label="Voluntary CPF Top-up"
          description="Tax relief for cash top-ups to CPF SA/RA"
          value={voluntaryCpfTopUp}
          onChange={onVoluntaryCpfTopUpChange}
          max={voluntaryCpfTopUpLimit}
          currency="SGD"
        />
      ) : null}

      {showSrsContribution ? (
        <ContributionSlider
          label="SRS Contribution"
          description="100% tax deductible - significant savings for high earners"
          value={srsContribution}
          onChange={onSrsContributionChange}
          max={srsContributionLimit}
          currency="SGD"
        />
      ) : null}

      {showSrsContribution ? (
        <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
          <span className="text-emerald-400">Tip:</span> At the 24% top
          marginal rate, maxing SRS saves about S$
          {Math.round(srsContributionLimit * 0.24).toLocaleString()} in tax.
        </p>
      ) : null}
    </div>
  );
}
