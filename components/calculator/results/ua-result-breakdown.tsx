import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function UAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "UA" || breakdown.type !== "UA") {
    return null;
  }

  return (
    <>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Withheld from Salary</p>
      <DeductionRow
        label={`Personal Income Tax (${formatPercentage(breakdown.incomeTax.rate)})`}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Military Tax (${formatPercentage(breakdown.militaryTax.rate)})`}
        amount={taxes.militaryTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer USC ({formatPercentage(breakdown.employerUsc.rate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.employerUsc.total, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer unified social contribution on capped base; not deducted from
        take-home pay.
      </p>
    </>
  );
}
