import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function ATResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "AT" || breakdown.type !== "AT") {
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
      {(breakdown.commuterAllowance > 0 ||
        breakdown.familyBonusPlusCredit > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Local Allowances and Credits
          </p>
          {breakdown.commuterAllowance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Commuter Allowance</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.commuterAllowance, currency)}
              </span>
            </div>
          )}
          {breakdown.familyBonusPlusCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Family Bonus Plus</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.familyBonusPlusCredit, currency)}
              </span>
            </div>
          )}
        </>
      )}
      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="Wage Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Employee Social Insurance"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
