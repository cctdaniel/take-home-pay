"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeductionRow } from "./deduction-row";
import { formatCurrency, formatCurrencyWithCents, formatPercentage } from "@/lib/format";
import type { CalculationResult, PayFrequency } from "@/lib/tax-calculations/types";
import { getStateCalculator, hasNoIncomeTax } from "@/lib/tax-calculations/states";

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

  const stateCalculator = getStateCalculator(state);
  const stateName = stateCalculator?.getStateName() ?? state;
  const isNoTaxState = hasNoIncomeTax(state);
  const hasStateTaxes = taxes.stateIncomeTax > 0 || taxes.stateDisabilityInsurance > 0;

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-zinc-300">
          Take-Home Pay
        </CardTitle>
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
