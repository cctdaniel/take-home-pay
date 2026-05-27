import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function NZResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "NZ" || breakdown.type !== "NZ") {
    return null;
  }

  const isAccCapped =
    grossSalary > breakdown.acc.maximumEarnings &&
    breakdown.acc.liableEarnings === breakdown.acc.maximumEarnings;
  const hasTaxCredits =
    taxes.independentEarnerTaxCredit > 0 || taxes.donationTaxCredit > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isTaxResident ? "NZ Tax Resident" : "Non-Resident"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      <DeductionRow
        label="Gross Income Tax"
        amount={taxes.grossIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {hasTaxCredits && (
        <div className="space-y-1 pt-1">
          {taxes.independentEarnerTaxCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Independent Earner Tax Credit
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(taxes.independentEarnerTaxCredit, currency)}
              </span>
            </div>
          )}
          {taxes.donationTaxCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Donation Tax Credit</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(taxes.donationTaxCredit, currency)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Net Income Tax</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(taxes.incomeTax, currency)}
            </span>
          </div>
        </div>
      )}
      {breakdown.taxCredits.donationCreditAppliedAgainstIncomeTaxOnly && (
        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">
          Donation credits are capped at income tax in this salary estimate.
          End-of-year refund timing, transfers, and partner sharing are not
          modeled.
        </p>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">ACC</p>
      <DeductionRow
        label={`Earners Levy (${formatPercentage(breakdown.acc.rate)})`}
        amount={taxes.accEarnersLevy}
        grossSalary={grossSalary}
        currency={currency}
      />
      {isAccCapped && (
        <p className="text-xs text-zinc-500 italic mt-1">
          ACC earners levy is capped at{" "}
          {formatCurrency(breakdown.acc.maximumEarnings, currency)} of liable
          earnings for {breakdown.acc.period}.
        </p>
      )}

      {taxes.studentLoanRepayment > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">Student Loan</p>
          <DeductionRow
            label={`Student Loan (${formatPercentage(
              breakdown.studentLoan.repaymentRate,
            )} over threshold)`}
            amount={taxes.studentLoanRepayment}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="text-xs text-zinc-500 italic mt-1">
            Threshold:{" "}
            {formatCurrency(breakdown.studentLoan.annualThreshold, currency)}.
          </p>
        </>
      )}

      {(breakdown.kiwiSaver.employeeContribution > 0 ||
        breakdown.donations.payrollGivingDonations > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Voluntary Payroll Deductions
          </p>
          {breakdown.kiwiSaver.employeeContribution > 0 && (
            <DeductionRow
              label={`KiwiSaver Employee (${formatPercentage(
                breakdown.kiwiSaver.employeeRate,
              )})`}
              amount={breakdown.kiwiSaver.employeeContribution}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.donations.payrollGivingDonations > 0 && (
            <DeductionRow
              label="Payroll Giving Donations"
              amount={breakdown.donations.payrollGivingDonations}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}

      {breakdown.kiwiSaver.employerContributionBeforeEsct > 0 && (
        <>
          <div className="flex items-center justify-between py-2 opacity-60">
            <span className="text-sm text-zinc-400">
              Employer KiwiSaver before ESCT (
              {formatPercentage(breakdown.kiwiSaver.employerRate)})
            </span>
            <span className="text-sm text-zinc-500 tabular-nums">
              +
              {formatCurrency(
                breakdown.kiwiSaver.employerContributionBeforeEsct,
                currency,
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-500 italic">
            Employer KiwiSaver is paid to the scheme, taxed through ESCT, and is
            not included in take-home pay.
          </p>
        </>
      )}

      {breakdown.kiwiSaver.governmentContribution > 0 && (
        <>
          <div className="flex items-center justify-between py-2 opacity-60">
            <span className="text-sm text-zinc-400">
              KiwiSaver government contribution
            </span>
            <span className="text-sm text-zinc-500 tabular-nums">
              +{formatCurrency(breakdown.kiwiSaver.governmentContribution, currency)}
            </span>
          </div>
          <p className="text-xs text-zinc-500 italic">
            Shown for retirement-account context only; not included in salary
            take-home. Full annual amount requires at least{" "}
            {formatCurrency(
              breakdown.kiwiSaver.governmentContributionEmployeeContributionForMax,
              currency,
            )}{" "}
            of eligible member contributions.
          </p>
        </>
      )}

      <ResultNotes
        countryName="New Zealand"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
