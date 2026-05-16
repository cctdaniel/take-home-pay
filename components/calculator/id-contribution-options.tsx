"use client";

import { CurrencyAmountField } from "@/components/calculator/calculator-fields";
import { InfoPanel } from "@/components/calculator/info-panel";

interface IDContributionOptionsProps {
  dplkContribution: number;
  onDplkContributionChange: (value: number) => void;
  zakatContribution: number;
  onZakatContributionChange: (value: number) => void;
}

export function IDContributionOptions({
  dplkContribution,
  onDplkContributionChange,
  zakatContribution,
  onZakatContributionChange,
}: IDContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Tax-Deductible Contributions
      </h3>

      <div className="space-y-4">
        <CurrencyAmountField
          id="id-dplk"
          label="DPLK Pension (Rp/year)"
          value={dplkContribution}
          onChange={onDplkContributionChange}
          currency="IDR"
          step={1000000}
          description="Dana Pensiun Lembaga Keuangan contributions reduce taxable income."
        />

        <CurrencyAmountField
          id="id-zakat"
          label="Zakat (Rp/year)"
          value={zakatContribution}
          onChange={onZakatContributionChange}
          currency="IDR"
          step={1000000}
          description="Zakat paid to BAZNAS or authorized institutions reduces taxable income."
        />
      </div>

      <InfoPanel title="Tip" tone="positive">
        Both DPLK and Zakat contributions are fully tax-deductible, reducing
        your taxable income and lowering your PPh 21 tax.
      </InfoPanel>
    </div>
  );
}
