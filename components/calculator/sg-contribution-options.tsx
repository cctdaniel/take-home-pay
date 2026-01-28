"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

interface ContributionSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  description?: string;
  currency?: string;
}

function ContributionSlider({
  label,
  value,
  onChange,
  max,
  description,
  currency = "SGD",
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
            {formatCurrency(value, currency as "USD" | "SGD")}
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
        <span>S$0</span>
        <span>{formatCurrency(max, "SGD")} limit</span>
      </div>
    </div>
  );
}

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
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Voluntary Tax-Saving Contributions
      </h3>

      <ContributionSlider
        label="Voluntary CPF Top-up"
        description="Tax relief for cash top-ups to CPF SA/RA"
        value={voluntaryCpfTopUp}
        onChange={onVoluntaryCpfTopUpChange}
        max={voluntaryCpfTopUpLimit}
        currency="SGD"
      />

      <ContributionSlider
        label="SRS Contribution"
        description="100% tax deductible - significant savings for high earners"
        value={srsContribution}
        onChange={onSrsContributionChange}
        max={srsContributionLimit}
        currency="SGD"
      />

      <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
        <span className="text-emerald-400">Tip:</span> At top marginal rate (24%), maxing SRS saves ~S$3,670/year in tax
      </p>
    </div>
  );
}
