import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
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
      {breakdown.expatRecurringAllowance > 0 && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Special Expat Recurring Allowance
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              +{formatCurrency(breakdown.expatRecurringAllowance, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Gross Cash Compensation
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.grossCashCompensation, currency)}
            </span>
          </div>
        </>
      )}
      {breakdown.taxableBenefitsInKind > 0 && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Taxable Benefits in Kind
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              +{formatCurrency(breakdown.taxableBenefitsInKind, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Federal Tax / ONSS Gross Base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableEmploymentIncome, currency)}
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
        Taxable Income Deductions
      </p>
      {breakdown.expatRecurringAllowance > 0 && (
        <div className="space-y-1 py-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Tax-Free Expat Allowance
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.expatRecurringAllowance, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              ONSS / RSZ-Exempt Portion
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(
                breakdown.expatSocialSecurityExemptAllowance,
                currency,
              )}
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Professional Expense Deduction
        </span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.standardDeduction, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Tax Reductions</p>
      {breakdown.personalTaxAllowanceCredit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Personal Tax Allowance Reduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.personalTaxAllowanceCredit, currency)}
          </span>
        </div>
      )}
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
      {breakdown.childcareTaxReduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Childcare Tax Reduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.childcareTaxReduction, currency)}
          </span>
        </div>
      )}
      {breakdown.charitableDonationTaxReduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Gift Tax Reduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(
              breakdown.charitableDonationTaxReduction,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.expatRegimeType === "inboundTaxpayer" &&
        !breakdown.expatTaxpayerMinimumMet && (
          <p className="text-xs text-amber-200 py-1">
            The inbound taxpayer salary threshold is{" "}
            {formatCurrency(
              breakdown.expatTaxpayerMinimumSalary,
              currency,
            )}
            , so no special allowance is applied at this salary.
          </p>
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

      <ResultNotes
        countryName="Belgium"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
