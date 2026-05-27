import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
}) {
  if (amount <= 0) return null;

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-emerald-400">{label}</span>
      <span className="text-sm text-emerald-400 tabular-nums">
        -{formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function SEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "SE" || breakdown.type !== "SE") {
    return null;
  }

  const voluntary = breakdown.voluntaryDeductions;
  const hasTaxableIncomeDeductions =
    voluntary.privatePensionSavings > 0 ||
    voluntary.commutingDeduction > 0 ||
    voluntary.otherWorkExpenseDeduction > 0;
  const hasTaxReductions =
    breakdown.employeeSocialTaxCredit > 0 ||
    voluntary.appliedTaxReductions > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Regime</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.taxRegime === "expertRelief"
            ? "Expert tax relief"
            : "Ordinary salary"}
        </span>
      </div>

      {breakdown.expertRelief && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">Expert Relief Exempt</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.expertRelief.exemptIncome, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Taxed Salary Base</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(
                breakdown.expertRelief.taxableSalaryBase,
                currency,
              )}
            </span>
          </div>
        </>
      )}

      {breakdown.taxRegime === "ordinary" && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">Municipal Tax Rate</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatPercentage(breakdown.municipalTaxRate)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Occupational Pension</span>
            <span className="text-sm text-zinc-200">
              {breakdown.noOccupationalPension
                ? "No employer rights"
                : "Employer rights assumed"}
            </span>
          </div>
        </>
      )}

      {hasTaxableIncomeDeductions && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Taxable Income Deductions
          </p>
          {voluntary.privatePensionSavings > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Private Pension Savings
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(voluntary.privatePensionSavings, currency)}
              </span>
            </div>
          )}
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
          {voluntary.otherWorkExpenseDeduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Other Work Expense Deduction
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(voluntary.otherWorkExpenseDeduction, currency)}
              </span>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="Income tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.employeeSocialContribution.amount > 0 && (
        <DeductionRow
          label={breakdown.employeeSocialContribution.name}
          amount={breakdown.employeeSocialContribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      {voluntary.privatePensionSavings > 0 && (
        <DeductionRow
          label="Private Pension Savings Paid"
          amount={voluntary.privatePensionSavings}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}

      {hasTaxReductions && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">Tax Reductions</p>
          <ReliefRow
            label="General Pension Contribution Credit"
            amount={breakdown.employeeSocialTaxCredit}
            currency={currency}
          />
          <ReliefRow
            label="ROT/RUT Tax Reduction"
            amount={voluntary.rotRutTaxReduction}
            currency={currency}
          />
          <ReliefRow
            label="Green Technology Tax Reduction"
            amount={voluntary.greenTechnologyTaxReduction}
            currency={currency}
          />
        </>
      )}
      <ResultNotes
        countryName="Sweden"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
