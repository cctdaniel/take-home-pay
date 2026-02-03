// ============================================================================
// SWITZERLAND CONTRIBUTION OPTIONS (PILLAR 3A)
// ============================================================================

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CH_PILLAR3A_2026 } from "@/lib/countries/ch/constants/tax-brackets-2026";

interface CHContributionOptionsProps {
  pillar3aContribution: number;
  onPillar3aContributionChange: (value: number) => void;
  includeBVG: boolean;
  onIncludeBVGChange: (value: boolean) => void;
  includeHealthInsurance: boolean;
  onIncludeHealthInsuranceChange: (value: boolean) => void;
}

export function CHContributionOptions({
  pillar3aContribution,
  onPillar3aContributionChange,
  includeBVG,
  onIncludeBVGChange,
  includeHealthInsurance,
  onIncludeHealthInsuranceChange,
}: CHContributionOptionsProps) {
  const maxContribution = CH_PILLAR3A_2026.maxContributionWithPension;

  return (
    <div className="space-y-6">
      {/* Pillar 3a Contribution */}
      <ContributionSlider
        label="Pillar 3a Contribution"
        description={`Tax-deductible voluntary pension contribution. Maximum: CHF ${maxContribution.toLocaleString()} for 2026.`}
        value={pillar3aContribution}
        onChange={onPillar3aContributionChange}
        max={maxContribution}
        currency="CHF"
      />

      {pillar3aContribution > 0 && (
        <p className="text-xs text-emerald-400 bg-emerald-400/10 rounded p-2">
          Your Pillar 3a contribution of CHF {pillar3aContribution.toLocaleString()} is fully tax-deductible from your federal, cantonal, and municipal taxable income.
        </p>
      )}

      <Separator />

      {/* BVG Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-200">Include BVG (Occupational Pension)</p>
          <p className="text-xs text-zinc-500">
            Mandatory 2nd pillar pension contributions based on age
          </p>
        </div>
        <Switch
          checked={includeBVG}
          onCheckedChange={onIncludeBVGChange}
        />
      </div>

      {includeBVG && (
        <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400">
          <p className="mb-1">
            <span className="text-zinc-300">BVG (Berufliche Vorsorge)</span> is mandatory for employees with annual income exceeding CHF 22,680.
          </p>
          <p>
            Contributions are calculated on the "coordinated salary" (gross salary minus CHF 26,460 coordination deduction), capped at CHF 64,260.
            The employer must pay at least 50% of the total contribution.
          </p>
        </div>
      )}

      <Separator />

      {/* Health Insurance Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-200">Show Health Insurance Cost</p>
          <p className="text-xs text-zinc-500">
            Include estimated health insurance premiums (informational only)
          </p>
        </div>
        <Switch
          checked={includeHealthInsurance}
          onCheckedChange={onIncludeHealthInsuranceChange}
        />
      </div>

      {includeHealthInsurance && (
        <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400">
          <p className="mb-1">
            <span className="text-zinc-300">Health insurance (LAMal/KVG)</span> is mandatory but paid separately, not deducted from your salary.
          </p>
          <p className="mb-1">
            Average premium for adults: ~CHF 393/month (varies by canton from CHF 300 to CHF 550+).
          </p>
          <p>
            Premiums are tax-deductible (up to CHF 1,800 single / CHF 3,600 married + CHF 700 per child federally).
          </p>
        </div>
      )}
    </div>
  );
}
