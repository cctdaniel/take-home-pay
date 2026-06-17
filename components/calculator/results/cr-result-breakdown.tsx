import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function CRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "CR" || breakdown.type !== "CR") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Monthly Gross</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(breakdown.monthlyGross, currency)}
        </span>
      </div>

      {(breakdown.dependentChildren > 0 || breakdown.spouseCredit > 0) && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Family Credits</span>
          <span className="text-sm tabular-nums text-zinc-200">
            −{formatCurrency(breakdown.annualTaxCredits, currency)}/yr
          </span>
        </div>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Mandatory Contributions</p>
      <DeductionRow
        label={`CCSS (${formatPercentage(breakdown.ccssRate)})`}
        amount={taxes.ccssEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Salary Income Tax</p>
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
              /mo
            </span>
            <span className="text-sm tabular-nums text-zinc-200">
              {formatCurrency(bracket.tax * 12, currency)}
            </span>
          </div>
        ))}
      {breakdown.annualTaxCredits > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Family tax credits</span>
          <span className="text-sm tabular-nums text-zinc-200">
            −{formatCurrency(breakdown.annualTaxCredits, currency)}
          </span>
        </div>
      ) : null}
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
