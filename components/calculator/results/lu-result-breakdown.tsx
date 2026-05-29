import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function LUResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "LU" || breakdown.type !== "LU") {
    return null;
  }

  return (
    <>
      <DeductionRow
        label={`Employee Social (${formatPercentage(breakdown.employeeSocial.rate)}, capped)`}
        amount={taxes.employeeSocial}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
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
        label="Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
