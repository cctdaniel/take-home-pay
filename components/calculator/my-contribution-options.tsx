"use client";

import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";

const LIFESTYLE_RELIEF_LIMIT = 2500;
const MEDICAL_RELIEF_LIMIT = 10000;

interface MYContributionOptionsProps {
  voluntaryEpfContribution: number;
  onVoluntaryEpfContributionChange: (value: number) => void;
  voluntaryEpfLimit: number;
  prsContribution: number;
  onPrsContributionChange: (value: number) => void;
  prsLimit: number;
  lifestyleRelief: number;
  onLifestyleReliefChange: (value: number) => void;
  medicalRelief: number;
  onMedicalReliefChange: (value: number) => void;
}

export function MYContributionOptions({
  voluntaryEpfContribution,
  onVoluntaryEpfContributionChange,
  voluntaryEpfLimit,
  prsContribution,
  onPrsContributionChange,
  prsLimit,
  lifestyleRelief,
  onLifestyleReliefChange,
  medicalRelief,
  onMedicalReliefChange,
}: MYContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Optional Retirement Contributions
        </h3>

        <ContributionSlider
          label="Voluntary EPF (RM/year)"
          value={voluntaryEpfContribution}
          onChange={onVoluntaryEpfContributionChange}
          currency="MYR"
          max={voluntaryEpfLimit}
          step={100}
          description="Extra EPF/i-Topup contribution. Annual voluntary contributions are capped separately from the RM4,000 EPF/life insurance tax relief bucket."
        />

        <ContributionSlider
          label="Private Retirement Scheme (RM/year)"
          value={prsContribution}
          onChange={onPrsContributionChange}
          currency="MYR"
          max={prsLimit}
          step={100}
          description={`PRS relief is capped at RM${prsLimit.toLocaleString()} per year.`}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Selected Resident Reliefs
        </h3>

        <ContributionSlider
          label="Lifestyle Relief (RM/year)"
          value={lifestyleRelief}
          onChange={onLifestyleReliefChange}
          currency="MYR"
          max={LIFESTYLE_RELIEF_LIMIT}
          step={100}
          description="Books, devices, internet, sport equipment, and qualifying lifestyle expenses, capped at RM2,500."
        />

        <ContributionSlider
          label="Medical Relief (RM/year)"
          value={medicalRelief}
          onChange={onMedicalReliefChange}
          currency="MYR"
          max={MEDICAL_RELIEF_LIMIT}
          step={100}
          description="Selected medical treatment, check-up, vaccination, or dental expenses, capped at RM10,000."
        />
      </div>

      <InfoPanel title="Malaysia assumptions" tone="neutral">
        Mandatory EPF, SOCSO, and EIS are calculated automatically. This
        calculator models selected common YA 2025 resident reliefs and does not
        include every possible HASiL deduction or rebate.
      </InfoPanel>
    </div>
  );
}
