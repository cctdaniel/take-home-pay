import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function FRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "FR" || breakdown.type !== "FR") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Household Parts</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.taxHouseholdParts} part{breakdown.taxHouseholdParts === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Taxable Income Deductions</p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">10% Employment Expense Deduction</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.standardDeduction, currency)}
        </span>
      </div>
      {breakdown.retirementSavingsDeduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">PER Retirement Savings Deduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.retirementSavingsDeduction, currency)}
          </span>
        </div>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Payroll Contributions</p>
      <DeductionRow
        label="Employee Social Contributions"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.retirementSavingsDeduction > 0 && (
        <DeductionRow
          label="PER Retirement Savings"
          amount={breakdown.retirementSavingsDeduction}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
    </>
  );
}
