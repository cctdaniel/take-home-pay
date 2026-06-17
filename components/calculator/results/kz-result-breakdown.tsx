import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function KZResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "KZ" || breakdown.type !== "KZ") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Standard Deduction</span>
        <span className="text-sm tabular-nums text-zinc-200">
          −{formatCurrency(breakdown.standardDeduction, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Mandatory Contributions</p>
      <DeductionRow
        label="OPC Pension (10%)"
        amount={taxes.opcEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`OMIC Health (2%, cap ${formatCurrency(breakdown.omicMonthlyCap, currency)}/mo)`}
        amount={taxes.omicEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Individual Income Tax</p>
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
            <span className="text-sm tabular-nums text-zinc-200">
              {formatCurrency(bracket.tax, currency)}
            </span>
          </div>
        ))}
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
