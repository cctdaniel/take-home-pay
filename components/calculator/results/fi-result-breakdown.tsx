import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { NordicResultBreakdown } from "./nordic-breakdown-shared";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function FIResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, grossSalary, currency } = props;
  const { taxes, breakdown } = result;

  if (
    !("type" in taxes) ||
    taxes.type !== "FI" ||
    breakdown.type !== "FI" ||
    !("voluntaryDeductions" in breakdown)
  ) {
    return <NordicResultBreakdown {...props} expectedCountry="FI" />;
  }

  const voluntary = breakdown.voluntaryDeductions;
  const hasVoluntaryRows =
    voluntary.commutingDeduction > 0 ||
    voluntary.unemploymentFundFees > 0 ||
    voluntary.otherIncomeProductionDeduction > 0 ||
    voluntary.householdExpenseCredit > 0 ||
    voluntary.voluntaryPensionInsurance > 0 ||
    voluntary.voluntaryPensionCredit > 0;

  return (
    <>
      <NordicResultBreakdown {...props} expectedCountry="FI" />

      {breakdown.taxableFringeBenefits > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Taxable Employment Benefits
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Taxable Fringe Benefits
            </span>
            <span className="text-sm text-zinc-300 tabular-nums">
              +{formatCurrency(breakdown.taxableFringeBenefits, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Taxable Employment Income
            </span>
            <span className="text-sm text-zinc-300 tabular-nums">
              {formatCurrency(breakdown.taxableEmploymentIncome, currency)}
            </span>
          </div>
        </>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Finnish Employee Contributions
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Employee Age</span>
        <span className="text-sm text-zinc-300 tabular-nums">
          {breakdown.age}
        </span>
      </div>
      {breakdown.employeeSocialContribution.pensionContribution > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Pension Contribution (
            {(breakdown.employeeSocialContribution.pensionRate * 100).toFixed(
              2,
            )}
            %)
          </span>
          <span className="text-sm text-zinc-300 tabular-nums">
            {formatCurrency(
              breakdown.employeeSocialContribution.pensionContribution,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.employeeSocialContribution.unemploymentContribution > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Unemployment Insurance (
            {(
              breakdown.employeeSocialContribution.unemploymentRate * 100
            ).toFixed(2)}
            %)
          </span>
          <span className="text-sm text-zinc-300 tabular-nums">
            {formatCurrency(
              breakdown.employeeSocialContribution.unemploymentContribution,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.employeeSocialContribution.healthCareContribution > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Health Care Contribution (
            {(
              breakdown.employeeSocialContribution.healthCareRate * 100
            ).toFixed(2)}
            %)
          </span>
          <span className="text-sm text-zinc-300 tabular-nums">
            {formatCurrency(
              breakdown.employeeSocialContribution.healthCareContribution,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.employeeSocialContribution.dailyAllowanceContribution > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Daily Allowance Contribution (
            {(
              breakdown.employeeSocialContribution.dailyAllowanceRate * 100
            ).toFixed(2)}
            %)
          </span>
          <span className="text-sm text-zinc-300 tabular-nums">
            {formatCurrency(
              breakdown.employeeSocialContribution.dailyAllowanceContribution,
              currency,
            )}
          </span>
        </div>
      )}

      {hasVoluntaryRows && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Finnish Deductions and Credits
          </p>
          {voluntary.commutingDeduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Commuting Deduction
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(voluntary.commutingDeduction, currency)}
              </span>
            </div>
          )}
          {voluntary.unemploymentFundFees > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Unemployment Fund Fees
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(voluntary.unemploymentFundFees, currency)}
              </span>
            </div>
          )}
          {voluntary.otherIncomeProductionDeduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Other Income-Production Expenses
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  voluntary.otherIncomeProductionDeduction,
                  currency,
                )}
              </span>
            </div>
          )}
          {voluntary.householdExpenseCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Household Expense Credit
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(voluntary.householdExpenseCredit, currency)}
              </span>
            </div>
          )}
          {voluntary.voluntaryPensionInsurance > 0 && (
            <DeductionRow
              label="Voluntary pension / PS savings"
              amount={voluntary.voluntaryPensionInsurance}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {voluntary.voluntaryPensionCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Voluntary Pension Deficit Credit
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(voluntary.voluntaryPensionCredit, currency)}
              </span>
            </div>
          )}
        </>
      )}
      <ResultNotes
        countryName="Finland"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
