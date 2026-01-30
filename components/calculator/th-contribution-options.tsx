"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";

interface THContributionOptionsProps {
  providentFund: number;
  onProvidentFundChange: (value: number) => void;
  providentFundLimit: number;
  rmf: number;
  onRmfChange: (value: number) => void;
  rmfLimit: number;
  ssf: number;
  onSsfChange: (value: number) => void;
  ssfLimit: number;
  esg: number;
  onEsgChange: (value: number) => void;
  esgLimit: number;
  nsf: number;
  onNsfChange: (value: number) => void;
  nsfLimit: number;
}

export function THContributionOptions({
  providentFund,
  onProvidentFundChange,
  providentFundLimit,
  rmf,
  onRmfChange,
  rmfLimit,
  ssf,
  onSsfChange,
  ssfLimit,
  esg,
  onEsgChange,
  esgLimit,
  nsf,
  onNsfChange,
  nsfLimit,
}: THContributionOptionsProps) {
  const totalRetirement = providentFund + rmf + ssf;
  const retirementRemaining = Math.max(0, 500000 - totalRetirement);

  return (
    <div className="space-y-6">
      {/* Provident Fund */}
      <ContributionSlider
        label="Provident Fund (PVD)"
        description={`Employee contribution - tax deductible up to 15% of income (max ฿500,000). Remaining shared limit: ฿${retirementRemaining.toLocaleString()}`}
        value={providentFund}
        onChange={onProvidentFundChange}
        max={Math.min(providentFundLimit, retirementRemaining + providentFund)}
        currency="THB"
      />

      {/* Retirement Mutual Fund */}
      <ContributionSlider
        label="Retirement Mutual Fund (RMF)"
        description={`Long-term retirement investment - tax deductible up to 30% of income. Must hold 5+ years and redeem at age 55+. Remaining shared limit: ฿${retirementRemaining.toLocaleString()}`}
        value={rmf}
        onChange={onRmfChange}
        max={Math.min(rmfLimit, retirementRemaining + rmf)}
        currency="THB"
      />

      {/* Super Savings Fund */}
      <ContributionSlider
        label="Super Savings Fund (SSF)"
        description={`Long-term savings - tax deductible up to 30% of income. Must hold 10+ years. Remaining shared limit: ฿${retirementRemaining.toLocaleString()}`}
        value={ssf}
        onChange={onSsfChange}
        max={Math.min(ssfLimit, retirementRemaining + ssf)}
        currency="THB"
      />

      {/* Thai ESG Fund */}
      <ContributionSlider
        label="Thai ESG Fund"
        description="Environment, Social, Governance investment - tax deductible up to 30% of income. Special period 2024-2026: hold 5+ years (normally 8+ years)."
        value={esg}
        onChange={onEsgChange}
        max={esgLimit}
        currency="THB"
      />

      {/* National Savings Fund */}
      <ContributionSlider
        label="National Savings Fund (NSF)"
        description="Government savings scheme - tax deductible up to ฿30,000/year"
        value={nsf}
        onChange={onNsfChange}
        max={nsfLimit}
        currency="THB"
      />

      {/* Shared Limit Note */}
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400">Shared Limit:</span> Provident Fund + RMF + SSF 
          + Pension Insurance combined cannot exceed ฿500,000 per year.
        </p>
        {totalRetirement > 500000 && (
          <p className="text-xs text-red-400 mt-2">
            Warning: Total retirement contributions (฿{totalRetirement.toLocaleString()}) 
            exceed the ฿500,000 limit. Tax deduction will be capped.
          </p>
        )}
      </div>
    </div>
  );
}
