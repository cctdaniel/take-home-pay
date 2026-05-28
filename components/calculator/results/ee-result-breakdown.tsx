import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function EEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "EE" || breakdown.type !== "EE") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Basic Allowance</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.basicAllowance, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label={`Income Tax (${formatPercentage(breakdown.incomeTax.rate)})`}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Contributions</p>
      <DeductionRow
        label={`Funded Pension (${formatPercentage(breakdown.pension.employeeRate)})`}
        amount={taxes.pensionEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Unemployment (${formatPercentage(breakdown.unemployment.employeeRate)})`}
        amount={taxes.unemploymentEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
