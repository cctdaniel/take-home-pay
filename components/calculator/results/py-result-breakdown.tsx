import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function PYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "PY" || breakdown.type !== "PY") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">IRP Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.irpTaxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Deductions</p>
      <DeductionRow
        label="IPS Employee (9%)"
        amount={taxes.ipsEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.incomeTax > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">IRP (above PYG 80M)</p>
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
            label="IRP Income Tax"
            amount={taxes.incomeTax}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : (
        <p className="mt-2 text-xs italic text-zinc-500">
          IRP not due — gross below PYG 80,000,000 threshold.
        </p>
      )}
    </>
  );
}
