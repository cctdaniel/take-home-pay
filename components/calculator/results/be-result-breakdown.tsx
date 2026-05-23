import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function BEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "BE" || breakdown.type !== "BE") {
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
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Taxable Income Deductions
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Professional Expense Deduction
        </span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.standardDeduction, currency)}
        </span>
      </div>
      {breakdown.pensionSavingsTaxCredit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Pension Savings Tax Reduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.pensionSavingsTaxCredit, currency)}
          </span>
        </div>
      )}
      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="Federal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Municipal Surcharge"
        amount={taxes.additionalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="ONSS / RSZ Employee Social Security"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.pensionSavingsContribution > 0 && (
        <DeductionRow
          label="Pension Savings"
          amount={breakdown.pensionSavingsContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
    </>
  );
}
