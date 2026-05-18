import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function IEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "IE" || breakdown.type !== "IE") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Status</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.taxStatus.replaceAll("_", " ")}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      {breakdown.pensionDeduction > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Taxable Income Deductions
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Pension Contribution Relief
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.pensionDeduction, currency)}
            </span>
          </div>
        </>
      )}
      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Credits, Tax, and Payroll Deductions
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          PAYE / Personal Tax Credits
        </span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.taxCredit, currency)}
        </span>
      </div>
      <DeductionRow
        label="PAYE Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Universal Social Charge"
        amount={taxes.additionalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Employee PRSI"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.pensionContribution > 0 && (
        <DeductionRow
          label="Pension Contribution"
          amount={breakdown.pensionContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
    </>
  );
}
