"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeductionRow } from "./deduction-row";
import { formatCurrency, formatCurrencyWithCents, formatPercentage } from "@/lib/format";
import type { CalculationResult, PayFrequency } from "@/lib/tax-calculations/types";
import { getStateCalculator, hasNoIncomeTax } from "@/lib/tax-calculations/state-tax";

interface ResultsBreakdownProps {
  result: CalculationResult;
  state: string;
  contributions: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
  };
}

function getFrequencyLabel(frequency: PayFrequency): string {
  switch (frequency) {
    case "annual":
      return "year";
    case "monthly":
      return "month";
    case "biweekly":
      return "pay period";
    case "weekly":
      return "week";
  }
}

export function ResultsBreakdown({ result, state, contributions }: ResultsBreakdownProps) {
  const { taxes, grossSalary } = result;
  const frequencyLabel = getFrequencyLabel(result.perPeriod.frequency);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const stateCalculator = getStateCalculator(state);
  const stateName = stateCalculator?.getStateName() ?? state;
  const isNoTaxState = hasNoIncomeTax(state);
  const hasStateTaxes = taxes.stateIncomeTax > 0 || taxes.stateDisabilityInsurance > 0;

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) =>
          !(node instanceof HTMLElement && node.dataset.downloadButton === "true"),
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `take-home-pay-${timestamp}.png`;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="sticky top-6" ref={cardRef}>
      <CardHeader className="pb-4 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium text-zinc-300">
          Take-Home Pay
        </CardTitle>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          data-download-button="true"
          aria-label="Download take-home pay section"
          className="inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition hover:text-zinc-100 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Net Amount */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-emerald-400 tracking-tight">
            {formatCurrency(result.netSalary)}
          </div>
          <div className="text-zinc-500 text-sm mt-2">
            {formatCurrencyWithCents(result.perPeriod.net)} per {frequencyLabel}
          </div>
        </div>

        {/* Effective Tax Rate */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-zinc-400">Effective Tax Rate</span>
          <span className="text-lg font-semibold text-zinc-200">
            {formatPercentage(result.effectiveTaxRate)}
          </span>
        </div>

        <Separator />

        {/* Breakdown */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Breakdown
          </h4>

          {/* Gross */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-300 font-medium">Gross Salary</span>
            <span className="text-sm font-medium text-zinc-200 tabular-nums">
              {formatCurrency(grossSalary)}
            </span>
          </div>

          <Separator className="my-2" />

          {/* Federal Taxes */}
          <p className="text-xs text-zinc-500 pt-2 pb-1">Federal Taxes</p>
          <DeductionRow
            label="Federal Income Tax"
            amount={taxes.federalIncomeTax}
            grossSalary={grossSalary}
          />
          <DeductionRow
            label="Social Security"
            amount={taxes.socialSecurity}
            grossSalary={grossSalary}
          />
          <DeductionRow
            label="Medicare"
            amount={taxes.medicare}
            grossSalary={grossSalary}
          />
          {taxes.additionalMedicare > 0 && (
            <DeductionRow
              label="Additional Medicare"
              amount={taxes.additionalMedicare}
              grossSalary={grossSalary}
            />
          )}

          {/* State Taxes - only show if there are any */}
          {hasStateTaxes && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-zinc-500 pt-2 pb-1">{stateName} Taxes</p>
              {taxes.stateIncomeTax > 0 && (
                <DeductionRow
                  label="State Income Tax"
                  amount={taxes.stateIncomeTax}
                  grossSalary={grossSalary}
                />
              )}
              {taxes.stateDisabilityInsurance > 0 && (
                <DeductionRow
                  label="State Disability Insurance"
                  amount={taxes.stateDisabilityInsurance}
                  grossSalary={grossSalary}
                />
              )}
            </>
          )}

          {/* No State Tax Badge */}
          {isNoTaxState && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-400">{stateName} State Tax</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  No State Income Tax
                </span>
              </div>
            </>
          )}

          {/* Contributions */}
          {result.totalContributions > 0 && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-zinc-500 pt-2 pb-1">Contributions</p>
              {contributions.traditional401k > 0 && (
                <DeductionRow
                  label="401(k)"
                  amount={contributions.traditional401k}
                  grossSalary={grossSalary}
                />
              )}
              {contributions.hsa > 0 && (
                <DeductionRow
                  label="HSA"
                  amount={contributions.hsa}
                  grossSalary={grossSalary}
                />
              )}
              {contributions.rothIRA > 0 && (
                <DeductionRow
                  label="Roth IRA"
                  amount={contributions.rothIRA}
                  grossSalary={grossSalary}
                />
              )}
            </>
          )}

          {/* Totals */}
          <DeductionRow
            label="Total Taxes"
            amount={result.totalTax}
            grossSalary={grossSalary}
            variant="total"
          />

          <div className="flex items-center justify-between py-3 mt-2 bg-emerald-500/10 rounded-lg px-3 -mx-3">
            <span className="text-sm font-semibold text-emerald-400">Net Salary</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.netSalary)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
