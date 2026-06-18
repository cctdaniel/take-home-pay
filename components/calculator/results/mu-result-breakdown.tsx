import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function MUResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "MU" || breakdown.type !== "MU") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income (after CSG)</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Deductions</p>
      <DeductionRow
        label={`CSG (${formatPercentage(breakdown.csgRate)})`}
        amount={taxes.csgEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">PAYE</p>
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
        label="PAYE Income Tax"
        amount={breakdown.payeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.fairShareContribution > 0 ? (
        <DeductionRow
          label="Fair Share Contribution (15%)"
          amount={breakdown.fairShareContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
    </>
  );
}
