import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function ROResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "RO" || breakdown.type !== "RO") {
    return null;
  }

  return (
    <>
      <DeductionRow
        label={`CAS (${formatPercentage(breakdown.cas.rate)})`}
        amount={taxes.cas}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`CASS (${formatPercentage(breakdown.cass.rate)})`}
        amount={taxes.cass}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.personalDeduction > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Personal Deduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.personalDeduction, currency)}
          </span>
        </div>
      )}
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
