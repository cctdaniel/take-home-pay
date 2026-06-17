import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function MAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "MA" || breakdown.type !== "MA") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Contributions</p>
      <DeductionRow
        label="CNSS (4.48%, capped)"
        amount={breakdown.socialInsurance.cnss}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="AMO (2.26%)"
        amount={breakdown.socialInsurance.amo}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Professional Expenses (20%)</span>
        <span className="text-sm tabular-nums text-emerald-400">
          -{formatCurrency(breakdown.professionalExpenseDeduction, currency)}
        </span>
      </div>
      {breakdown.dependentCredit > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">
            Dependent Credit ({breakdown.dependents})
          </span>
          <span className="text-sm tabular-nums text-emerald-400">
            -{formatCurrency(breakdown.dependentCredit, currency)}
          </span>
        </div>
      )}
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax (IR)</p>
      {breakdown.bracketTaxes
        .filter((bracket) => bracket.tax > 0)
        .map((bracket, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              {formatPercentage(bracket.rate)} on{" "}
              {formatCurrency(bracket.min, currency)}
              {bracket.max === Infinity
                ? "+"
                : ` – ${formatCurrency(bracket.max, currency)}`}
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(bracket.tax, currency)}
            </span>
          </div>
        ))}
      <DeductionRow
        label="Income Tax (IR)"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
