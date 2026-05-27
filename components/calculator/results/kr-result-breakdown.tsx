import { Separator } from "@/components/ui/separator";
import {
  isKRBreakdown,
  isKRTaxBreakdown,
} from "@/lib/countries/types";
import { KR_SOURCE_URLS } from "@/lib/countries/kr/constants/tax-brackets-2026";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function KRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isKRTaxBreakdown(taxes) || !isKRBreakdown(breakdown)) {
    return null;
  }

  const nonTaxableRows = [
    ["Meal Allowance (식대)", breakdown.nonTaxableIncome.mealAllowance],
    [
      "Childcare Allowance (자녀보육수당)",
      breakdown.nonTaxableIncome.childcareAllowance,
    ],
  ] as const;
  const deductionRows = [
    [
      "Employment Income Deduction",
      breakdown.incomeDeductions.employmentIncomeDeduction,
    ],
    ["Dependent Deduction", breakdown.incomeDeductions.dependentDeduction],
    ["Child Deduction", breakdown.incomeDeductions.childDeduction],
    [
      "Child Under 7 Deduction",
      breakdown.incomeDeductions.childUnder7Deduction,
    ],
  ] as const;
  const creditRows = [
    ["Wage Earner Credit", breakdown.taxCredits.wageEarnerCredit],
    ["Standard Credit", breakdown.taxCredits.standardCredit],
    ["Child Tax Credit", breakdown.taxCredits.childTaxCredit],
    ["Pension Credit (IRP)", breakdown.taxCredits.pensionCredit],
    ["Insurance Premium Credit", breakdown.taxCredits.insuranceCredit],
    ["Medical Expense Credit", breakdown.taxCredits.medicalCredit],
    ["Education Expense Credit", breakdown.taxCredits.educationCredit],
    ["Donation Credit", breakdown.taxCredits.donationCredit],
    ["Rent Credit (월세)", breakdown.taxCredits.rentCredit],
  ] as const;

  return (
    <>
      {breakdown.taxDetails.foreignWorkerFlatTaxApplied ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Foreign Employee Flat-Tax Election
          </p>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            The 19% flat-tax election uses gross employment income as the base.
            Ordinary non-taxation, deductions, exemptions, and tax credits are
            not applied in this mode.
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Flat-Tax Base</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(
                breakdown.taxDetails.foreignWorkerFlatTaxBase ?? grossSalary,
                currency,
              )}
            </span>
          </div>
          {breakdown.taxDetails.ordinaryTotalIncomeTax !== undefined ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Ordinary Settlement Comparison
              </span>
              <span className="text-sm text-zinc-300 tabular-nums">
                {formatCurrency(
                  breakdown.taxDetails.ordinaryTotalIncomeTax,
                  currency,
                )}
              </span>
            </div>
          ) : null}
          <Separator className="my-2" />
        </>
      ) : null}

      {breakdown.taxDetails.nonResidentFlatTaxApplied ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-xs text-zinc-400">
          Non-resident tax is using the calculator&apos;s 19% national flat
          withholding proxy plus the 10% local income tax add-on.
        </div>
      ) : null}

      {breakdown.nonTaxableIncome.total > 0 ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Non-Taxable Income
          </p>
          {nonTaxableRows.map(([label, amount]) =>
            amount > 0 ? (
              <div className="flex items-center justify-between py-1" key={label}>
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>
            ) : null,
          )}
          <Separator className="my-2" />
        </>
      ) : null}

      {breakdown.incomeDeductions.totalDeductions >
      breakdown.incomeDeductions.basicDeduction ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Tax Deductions Applied
          </p>
          {deductionRows.map(([label, amount]) =>
            amount > 0 ? (
              <div className="flex items-center justify-between py-1" key={label}>
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>
            ) : null,
          )}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Basic Deduction</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.incomeDeductions.basicDeduction, currency)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
            <span className="text-sm text-zinc-300">Taxable Income</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableIncome, currency)}
            </span>
          </div>
          <Separator className="my-2" />
        </>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Income Tax Calculation
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Gross Tax (before credits)</span>
        <span className="text-sm text-zinc-300 tabular-nums">
          {formatCurrency(breakdown.taxDetails.grossIncomeTax, currency)}
        </span>
      </div>

      {breakdown.taxCredits.totalCredits > 0 ? (
        <>
          <p className="pb-1 pt-3 text-xs text-zinc-500">
            Tax Credits (세액공제)
          </p>
          {creditRows.map(([label, amount]) =>
            amount > 0 ? (
              <div className="flex items-center justify-between py-1" key={label}>
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>
            ) : null,
          )}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700/50 py-1">
            <span className="text-sm text-zinc-300">Total Credits</span>
            <span className="text-sm font-medium text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.taxCredits.totalCredits, currency)}
            </span>
          </div>
        </>
      ) : null}

      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-2">
        <span className="text-sm font-medium text-zinc-200">
          National Income Tax
        </span>
        <span className="text-sm font-medium text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.taxDetails.finalIncomeTax, currency)}
        </span>
      </div>

      {breakdown.taxCredits.totalCredits >
      breakdown.taxDetails.grossIncomeTax ? (
        <p className="mt-1 text-xs italic text-amber-400">
          Credits exceed gross tax; no income tax due.
        </p>
      ) : null}

      <DeductionRow
        label="Local Income Tax (10%)"
        amount={taxes.localIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Social Insurance (4 Major Insurance)
      </p>
      <DeductionRow
        label="National Pension"
        amount={taxes.nationalPension}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="-mt-1 mb-1 text-xs italic text-zinc-500">
        {(breakdown.socialInsurance.nationalPensionRate * 100).toFixed(1)}% of
        monthly income (capped)
      </p>
      <DeductionRow
        label="Health Insurance"
        amount={taxes.nationalHealthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Long-term Care"
        amount={taxes.longTermCareInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="-mt-1 mb-1 text-xs italic text-zinc-500">
        {(breakdown.socialInsurance.longTermCareRate * 100).toFixed(2)}% of
        health insurance
      </p>
      <DeductionRow
        label="Employment Insurance"
        amount={taxes.employmentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="mt-2 flex items-center justify-between border-t border-zinc-700 py-2">
        <span className="text-sm text-zinc-300">Total Social Insurance</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(
            breakdown.socialInsurance.totalSocialInsurance,
            currency,
          )}
        </span>
      </div>

      {breakdown.voluntaryContributions.total > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Pension and Credit Contributions
          </p>
          <DeductionRow
            label="Personal Pension / IRP"
            amount={breakdown.voluntaryContributions.personalPensionContribution}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : null}

      <Separator className="my-2" />
      <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          About Tax Credits:
        </p>
        <p className="text-xs text-zinc-500">
          Tax credits reduce your tax bill won-for-won. If credits exceed your
          gross tax, you pay ₩0 in income tax but still owe social insurance
          contributions.
        </p>
      </div>

      <ResultNotes
        countryName="South Korea"
        assumptions={[
          "Resident ordinary employment uses progressive national income tax, the 10% local income tax add-on, wage-earner deductions, family deductions, social-insurance deductions, and modeled year-end tax credits.",
          "The foreign-employee flat-tax election uses gross employment income and disables ordinary deductions, exemptions, and credits in this salary result.",
          "National Pension, National Health Insurance, long-term care, and employment insurance are modeled as employee salary deductions; employer shares are not deducted from take-home pay.",
          "Personal pension/IRP, insurance, medical, education, donation, and rent credits are capped in the calculator before they reduce tax.",
        ]}
        exclusions={[
          "Actual year-end settlement documentation, employer-size employment-insurance add-ons, non-wage income, treaty exemptions, and local-office payroll adjustments require separate taxpayer or employer facts.",
        ]}
        sourceUrls={KR_SOURCE_URLS}
      />
    </>
  );
}
