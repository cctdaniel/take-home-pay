import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function HUResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "HU" || breakdown.type !== "HU") {
    return null;
  }

  return (
    <>
      {breakdown.familyAllowance > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Family Allowance</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.familyAllowance, currency)}
          </span>
        </div>
      )}
      {breakdown.under25FullExemption && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Under-25 Exemption</span>
          <span className="rounded bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-300">
            Active
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
        label={`Personal Income Tax (${formatPercentage(breakdown.incomeTax.rate)})`}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Social Security TB (${formatPercentage(breakdown.socialSecurity.rate)})`}
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
