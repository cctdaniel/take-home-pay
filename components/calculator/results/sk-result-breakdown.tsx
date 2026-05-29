import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function SKResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "SK" || breakdown.type !== "SK") {
    return null;
  }

  return (
    <>
      {breakdown.nonTaxableAllowance > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Non-Taxable Amount (NCZD)</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.nonTaxableAllowance, currency)}
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
      <p className="pb-1 pt-2 text-xs text-zinc-500">Personal Income Tax</p>
      <DeductionRow
        label="Progressive PIT"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Contributions</p>
      <DeductionRow
        label={`Social Insurance (${formatPercentage(breakdown.socialInsurance.rate)})`}
        amount={taxes.socialInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Health Insurance (${formatPercentage(breakdown.healthInsurance.rate)})`}
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
