import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function PLResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "PL" || breakdown.type !== "PL") {
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
      <DeductionRow
        label={`ZUS (${formatPercentage(breakdown.zus.rate)})`}
        amount={taxes.zusEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Health Insurance (${formatPercentage(breakdown.healthInsurance.rate)})`}
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.childTaxCredit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Child Tax Credit</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.childTaxCredit, currency)}
          </span>
        </div>
      )}
      <DeductionRow
        label="Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
