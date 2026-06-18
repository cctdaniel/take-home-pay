import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function PAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "PA" || breakdown.type !== "PA") {
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
      <p className="pb-1 pt-2 text-xs text-zinc-500">Deductions</p>
      <DeductionRow
        label="CSS Employee (9.75%)"
        amount={taxes.cssEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Educational Insurance (1.25%)"
        amount={taxes.educationEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.voluntaryContributions.voluntaryPension > 0 ? (
        <DeductionRow
          label="Voluntary pension (Law 10/1993)"
          amount={breakdown.voluntaryContributions.voluntaryPension}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
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
        label="Salary Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
