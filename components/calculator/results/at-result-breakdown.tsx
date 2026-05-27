import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
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
      {breakdown.specialPayments > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Austrian Special Payments
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Regular Salary Portion
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.regularGrossIncome, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              13th / 14th Special Payments
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.specialPayments, currency)}
            </span>
          </div>
          {breakdown.regularTaxedSpecialPayments > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Special Payments Taxed as Regular Salary
              </span>
              <span className="text-sm text-amber-300 tabular-nums">
                {formatCurrency(
                  breakdown.regularTaxedSpecialPayments,
                  currency,
                )}
              </span>
            </div>
          )}
        </>
      )}
      {breakdown.taxableInKindBenefits > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Taxable Non-Cash Pay
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Taxable In-Kind Benefits
            </span>
            <span className="text-sm text-amber-300 tabular-nums">
              +{formatCurrency(breakdown.taxableInKindBenefits, currency)}{" "}
              taxable only
            </span>
          </div>
        </>
      )}
      {(breakdown.commuterAllowance > 0 ||
        breakdown.specialExpenseDeduction > 0 ||
        breakdown.taxCredit > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Allowances, Special Expenses, and Credits
          </p>
          {breakdown.commuterAllowance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Pendlerpauschale Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.commuterAllowance, currency)}
              </span>
            </div>
          )}
          {breakdown.churchContributions > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Church Contributions
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.churchContributions, currency)}
              </span>
            </div>
          )}
          {breakdown.charitableDonations > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Qualifying Donations
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.charitableDonations, currency)}
              </span>
            </div>
          )}
          {breakdown.voluntaryPensionInsurance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Voluntary Pension Insurance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.voluntaryPensionInsurance,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.transportationTaxCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Transportation Credit
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.transportationTaxCredit, currency)}
              </span>
            </div>
          )}
          {breakdown.transportationSurchargeCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Transportation Surcharge
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.transportationSurchargeCredit,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.elevatedCommuterTaxCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Elevated Commuter Credit
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.elevatedCommuterTaxCredit,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.commuterPendlereuroCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Pendlereuro Credit</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.commuterPendlereuroCredit, currency)}
              </span>
            </div>
          )}
          {breakdown.singleEarnerOrParentCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Single-Earner / Single-Parent Credit
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.singleEarnerOrParentCredit,
                  currency,
                )}
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
      {taxes.specialPaymentIncomeTax > 0 && (
        <DeductionRow
          label="Special Payment Wage Tax"
          amount={taxes.specialPaymentIncomeTax}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      <DeductionRow
        label="Employee Social Insurance"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.employeeSpecialSocialContribution > 0 && (
        <DeductionRow
          label="Special Payment Social Insurance"
          amount={taxes.employeeSpecialSocialContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      <ResultNotes
        countryName="Austria"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
