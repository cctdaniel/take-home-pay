import { Separator } from "@/components/ui/separator";
import {
  isAUBreakdown,
  isAUTaxBreakdown,
} from "@/lib/countries/types";
import { AU_SOURCE_URLS } from "@/lib/countries/au/constants/tax-brackets-2026";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function AUResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isAUTaxBreakdown(taxes) || !isAUBreakdown(breakdown)) {
    return null;
  }

  const hasAnnualDeductions =
    breakdown.workRelatedExpenses > 0 ||
    breakdown.charitableDonations > 0 ||
    breakdown.taxBaseBeforeAnnualDeductions !== breakdown.taxableIncome;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.isResident ? "Australian Resident" : "Foreign Resident"}
        </span>
      </div>
      {breakdown.isResident ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Medicare Threshold</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {breakdown.medicareFamilyStatus === "family"
                ? "Family / sole parent"
                : "Single"}
            </span>
          </div>
          {breakdown.medicareFamilyStatus === "family" ? (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Spouse Taxable Income
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(breakdown.medicareSpouseIncome, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Dependent Children
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {breakdown.numberOfDependentChildren}
                </span>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      <Separator className="my-2" />
      {hasAnnualDeductions ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Australia Annual Deductions
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Tax Base Before Annual Deductions
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(
                breakdown.taxBaseBeforeAnnualDeductions,
                currency,
              )}
            </span>
          </div>
          {breakdown.workRelatedExpenses > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Work-Related Deductions
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.workRelatedExpenses, currency)}
              </span>
            </div>
          ) : null}
          {breakdown.charitableDonations > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                DGR Gifts / Donations
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.charitableDonations, currency)}
              </span>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700/50 py-1">
            <span className="text-sm font-medium text-zinc-300">
              Taxable Income
            </span>
            <span className="text-sm font-medium text-zinc-100 tabular-nums">
              {formatCurrency(breakdown.taxableIncome, currency)}
            </span>
          </div>
          <Separator className="my-2" />
        </>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Australia Income Tax
      </p>
      <DeductionRow
        label="Gross Income Tax"
        amount={breakdown.grossIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.isResident && breakdown.lito > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Low Income Tax Offset (LITO)
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.lito, currency)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700/50 py-1 pt-1">
            <span className="text-sm font-medium text-zinc-300">
              Net Income Tax
            </span>
            <span className="text-sm font-medium text-zinc-100 tabular-nums">
              {formatCurrency(taxes.incomeTax, currency)}
            </span>
          </div>
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Medicare</p>
      {breakdown.isResident ? (
        <>
          <DeductionRow
            label="Medicare Levy (2%)"
            amount={taxes.medicareLevy}
            grossSalary={grossSalary}
            currency={currency}
          />
          {breakdown.medicareLevyReductionApplied ? (
            <p className="mt-1 text-xs italic text-emerald-400">
              Reduced by low-income Medicare threshold.
            </p>
          ) : null}
          {taxes.medicareLevySurcharge > 0 ? (
            <DeductionRow
              label="Medicare Levy Surcharge"
              amount={taxes.medicareLevySurcharge}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {taxes.medicareLevySurcharge === 0 &&
          breakdown.hasPrivateHealthInsurance ? (
            <p className="mt-1 text-xs italic text-emerald-400">
              No surcharge - private health insurance held.
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Medicare Levy</span>
          <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400">
            Exempt (Non-Resident)
          </span>
        </div>
      )}

      {taxes.division293Tax > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Division 293 Tax (High Income Earners)
          </p>
          <DeductionRow
            label="Additional Tax on Super"
            amount={taxes.division293Tax}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Applies when income plus super exceeds A$250,000.
          </p>
        </>
      ) : null}

      {breakdown.superannuation.salarySacrificeContribution > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Employee Super Contribution
          </p>
          <DeductionRow
            label="Salary-sacrifice / deductible concessional super"
            amount={breakdown.superannuation.salarySacrificeContribution}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Counts toward the ATO A$
            {breakdown.superannuation.concessionalCap.toLocaleString()}{" "}
            concessional cap with employer Super Guarantee.
          </p>
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Superannuation (Employer Contribution)
      </p>
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Super Guarantee ({(breakdown.superannuation.rate * 100).toFixed(0)}%)
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +
          {formatCurrency(
            breakdown.superannuation.employerContribution,
            currency,
          )}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Employer pays this on top of your salary - not deducted from take-home
        pay.
      </p>
      {breakdown.superannuation.concessionalContributions > 0 ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Modeled concessional super total:{" "}
          {formatCurrency(
            breakdown.superannuation.concessionalContributions,
            currency,
          )}
        </p>
      ) : null}

      <ResultNotes
        countryName="Australia"
        assumptions={[
          breakdown.isResident
            ? "Resident tax rates, Medicare levy, Medicare levy surcharge, and LITO are modeled from the entered residency, family, private-health, and income facts."
            : "Foreign-resident tax rates are modeled without the resident tax-free threshold, Medicare levy, or LITO.",
          "Employer Super Guarantee is shown for context and not deducted from take-home pay.",
          "Salary-sacrifice or deductible concessional super is modeled as an employee cash deduction and counts toward the concessional contributions cap.",
          "Work-related deductions and DGR gifts are entered annual amounts; record substantiation and deduction-category eligibility are not modeled.",
        ]}
        sourceUrls={AU_SOURCE_URLS}
      />
    </>
  );
}
