import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function ISResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "IS" || breakdown.type !== "IS") {
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
      {breakdown.foreignExpertRelief.applies && (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Foreign Expert Taxable-Income Reduction
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -
              {formatCurrency(
                breakdown.foreignExpertRelief.exemptAmount,
                currency,
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-500 italic">
            Approved foreign expert relief taxes{" "}
            {formatPercentage(1 - breakdown.foreignExpertRelief.rate)} of
            employment income for the first {breakdown.foreignExpertRelief.years}{" "}
            years. Pension contributions remain based on total income.
          </p>
        </>
      )}

      {(breakdown.employeeSocialContribution.amount > 0 ||
        breakdown.voluntaryContributions.length > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Pension and Annual-Return Deductions
          </p>
          {breakdown.employeeSocialContribution.amount > 0 && (
            <DeductionRow
              label={breakdown.employeeSocialContribution.name}
              amount={breakdown.employeeSocialContribution.amount}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryContributions.map((contribution) => (
            <DeductionRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              grossSalary={grossSalary}
              currency={currency}
            />
          ))}
          {breakdown.voluntaryContributions.some(
            (contribution) => contribution.cashFlowTreatment === "taxOnly",
          ) ? (
            <p className="text-xs text-zinc-500 italic">
              Annual-return deductions reduce the modeled income-tax base; they
              are not treated as payroll cash deductions from salary.
            </p>
          ) : null}
        </>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="Income tax after personal credit"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <ResultNotes
        countryName="Iceland"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
