import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function RSResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "RS" || breakdown.type !== "RS") {
    return null;
  }

  return (
    <>
      <DeductionRow
        label={`Social Security (${formatPercentage(breakdown.socialSecurity.rate)})`}
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Non-Taxable Amount</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.nonTaxableAmount, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <DeductionRow
        label={`Income Tax (${formatPercentage(breakdown.incomeTax.rate)})`}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
