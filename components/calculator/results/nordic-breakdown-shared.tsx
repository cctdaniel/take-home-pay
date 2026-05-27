import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

type NordicResultBreakdownData = {
  type: string;
  taxableIncome: number;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
  };
  employeeSocialTaxCredit?: number;
  taxRegime?: string;
  specialRegime?: {
    name: string;
    rate: number;
    incomeTax: number;
    employeeSocialContribution?: number;
  };
  expertRelief?: {
    exemptIncome: number;
    taxableSalaryBase: number;
    exemptRate: number;
  };
};

export function NordicResultBreakdown({
  result,
  grossSalary,
  currency,
  expectedCountry,
}: CountryResultBreakdownProps & { expectedCountry: string }) {
  const { taxes, breakdown } = result;

  if (
    !("type" in taxes) ||
    taxes.type !== expectedCountry ||
    !("incomeTax" in taxes) ||
    breakdown.type !== expectedCountry ||
    !("employeeSocialContribution" in breakdown)
  ) {
    return null;
  }

  const nordicBreakdown = breakdown as unknown as NordicResultBreakdownData;

  return (
    <>
      {nordicBreakdown.specialRegime && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">Tax Regime</span>
            <span className="text-sm text-zinc-200 text-right">
              {nordicBreakdown.specialRegime.name}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Regime Rate</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatPercentage(nordicBreakdown.specialRegime.rate)}
            </span>
          </div>
        </>
      )}

      {nordicBreakdown.expertRelief && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">Expert Relief Exempt</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(nordicBreakdown.expertRelief.exemptIncome, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Taxed Salary Base</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(
                nordicBreakdown.expertRelief.taxableSalaryBase,
                currency,
              )}
            </span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="Income tax"
        amount={taxes.incomeTax as number}
        grossSalary={grossSalary}
        currency={currency}
      />
      {nordicBreakdown.employeeSocialContribution.amount > 0 && (
        <DeductionRow
          label={nordicBreakdown.employeeSocialContribution.name}
          amount={nordicBreakdown.employeeSocialContribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      {(nordicBreakdown.employeeSocialTaxCredit ?? 0) > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Pension contribution tax reduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              nordicBreakdown.employeeSocialTaxCredit ?? 0,
              currency,
            )}
          </span>
        </div>
      )}
    </>
  );
}
