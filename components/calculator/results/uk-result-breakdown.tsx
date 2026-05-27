import { Separator } from "@/components/ui/separator";
import {
  isUKBreakdown,
  isUKTaxBreakdown,
} from "@/lib/countries/types";
import { UK_SOURCE_URLS } from "@/lib/countries/uk/constants/tax-brackets-2026-27";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function UKResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isUKTaxBreakdown(taxes) || !isUKBreakdown(breakdown)) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Region</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.region === "scotland"
            ? "Scotland (Scottish rates)"
            : "England, Wales & Northern Ireland"}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Residency Status</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.isResident
            ? "UK Resident"
            : "Non-Resident (No Personal Allowance)"}
        </span>
      </div>

      {breakdown.taxableBenefitsInKind > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            UK Taxable Benefits In Kind
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              HMRC cash-equivalent value
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableBenefitsInKind, currency)}
            </span>
          </div>
          <p className="mt-1 text-xs italic text-zinc-500">
            Income tax base includes benefits in kind:{" "}
            {formatCurrency(breakdown.taxableGrossIncome, currency)}. Employee
            Class 1 NI remains based on cash salary in this model.
          </p>
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        UK Personal Allowance
      </p>
      {breakdown.personalAllowance > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Standard Personal Allowance
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(12570, currency)}
            </span>
          </div>
          {breakdown.personalAllowanceReduction > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Taper Reduction (above £100k)
              </span>
              <span className="text-sm text-amber-400 tabular-nums">
                +{formatCurrency(breakdown.personalAllowanceReduction, currency)}
              </span>
            </div>
          ) : null}
          {breakdown.marriageAllowanceTransferredOut > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Marriage Allowance Transferred
              </span>
              <span className="text-sm text-amber-400 tabular-nums">
                +
                {formatCurrency(
                  breakdown.marriageAllowanceTransferredOut,
                  currency,
                )}
              </span>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700/50 py-1">
            <span className="text-sm text-zinc-300">
              Effective Personal Allowance
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.personalAllowance, currency)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Personal Allowance</span>
          <span className="rounded bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-400">
            Not Available
          </span>
        </div>
      )}
      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
        <span className="text-sm text-zinc-300">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        UK Income Tax {breakdown.region === "scotland" ? "(Scottish Rates)" : ""}
      </p>
      {breakdown.bracketTaxes.map((bracket) => (
        <div
          className="flex items-center justify-between py-1"
          key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
        >
          <span className="text-sm text-zinc-400">
            {(bracket.rate * 100).toFixed(0)}%{" "}
            {formatCurrency(bracket.min, currency)}
            {bracket.max === Infinity
              ? "+"
              : ` - ${formatCurrency(bracket.max, currency)}`}
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(bracket.tax, currency)}
          </span>
        </div>
      ))}
      <DeductionRow
        label="Total Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.marriageAllowanceTaxReduction > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-emerald-400">
            Marriage Allowance Tax Reduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.marriageAllowanceTaxReduction, currency)}
          </span>
        </div>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        National Insurance (Class 1 Employee)
      </p>
      {breakdown.nationalInsurance.mainContribution > 0 ? (
        <DeductionRow
          label={`Main Rate (${(
            breakdown.nationalInsurance.mainRate * 100
          ).toFixed(0)}% on £${breakdown.nationalInsurance.primaryThreshold.toLocaleString()} - £${breakdown.nationalInsurance.upperEarningsLimit.toLocaleString()})`}
          amount={breakdown.nationalInsurance.mainContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {breakdown.nationalInsurance.additionalContribution > 0 ? (
        <DeductionRow
          label={`Additional Rate (${(
            breakdown.nationalInsurance.additionalRate * 100
          ).toFixed(0)}% above £${breakdown.nationalInsurance.upperEarningsLimit.toLocaleString()})`}
          amount={breakdown.nationalInsurance.additionalContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      <DeductionRow
        label="Total National Insurance"
        amount={taxes.nationalInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />

      {(taxes.studentLoanRepayment > 0 ||
        taxes.postgraduateLoanRepayment > 0) ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Student Loan Deductions
          </p>
          {taxes.studentLoanRepayment > 0 ? (
            <DeductionRow
              label={`Student Loan ${breakdown.studentLoan.plan.replace(
                "plan",
                "Plan ",
              )} (${(breakdown.studentLoan.rate * 100).toFixed(0)}% above £${breakdown.studentLoan.threshold.toLocaleString()})`}
              amount={taxes.studentLoanRepayment}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {taxes.postgraduateLoanRepayment > 0 ? (
            <DeductionRow
              label={`Postgraduate Loan (${(
                breakdown.postgraduateLoan.rate * 100
              ).toFixed(0)}% above £${breakdown.postgraduateLoan.threshold.toLocaleString()})`}
              amount={taxes.postgraduateLoanRepayment}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
        </>
      ) : null}

      {breakdown.pensionContribution > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            UK Pension Contribution
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Gross Contribution</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.pensionContribution, currency)}
            </span>
          </div>
          {breakdown.pensionTaxRelief > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-emerald-400">Tax Relief</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.pensionTaxRelief, currency)}
              </span>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700/50 py-1">
            <span className="text-sm text-zinc-300">Your Net Cost</span>
            <span className="text-sm font-medium text-zinc-100 tabular-nums">
              {formatCurrency(breakdown.pensionNetCost, currency)}
            </span>
          </div>
        </>
      ) : null}

      <ResultNotes
        countryName="United Kingdom"
        assumptions={[
          "Income tax uses 2026/27 UK or Scottish bands from the selected region and applies the personal allowance taper, residency setting, and marriage allowance settings.",
          "Class 1 employee National Insurance, student loans, postgraduate loans, taxable benefits in kind, and relief-at-source pension inputs are modeled as separate salary components.",
          "Taxable benefits in kind increase income tax in this model, while employee Class 1 NI remains based on cash salary.",
        ]}
        exclusions={[
          "PAYE tax-code adjustments, exact payroll-period withholding, employer pension matching, Scottish residence edge cases, Welsh rate changes, and company-car valuation worksheets require separate payroll facts.",
        ]}
        sourceUrls={UK_SOURCE_URLS}
      />
    </>
  );
}
