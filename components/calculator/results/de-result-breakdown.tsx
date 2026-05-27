import { Separator } from "@/components/ui/separator";
import {
  isDEBreakdown,
  isDETaxBreakdown,
} from "@/lib/countries/types";
import { DE_SOURCE_URLS } from "@/lib/countries/de/constants/tax-brackets-2026";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function DEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isDETaxBreakdown(taxes) || !isDEBreakdown(breakdown)) {
    return null;
  }

  const employerSocialSecurity =
    breakdown.socialSecurity.pension.employer +
    breakdown.socialSecurity.health.employer +
    breakdown.socialSecurity.unemployment.employer +
    breakdown.socialSecurity.longTermCare.employer;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Personal Status</span>
        <div className="flex gap-2">
          <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
            {breakdown.personalInfo.isMarried ? "Married" : "Single"}
          </span>
          {breakdown.personalInfo.isChurchMember ? (
            <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
              Church Member
            </span>
          ) : null}
          {breakdown.personalInfo.isChildless ? (
            <span className="rounded bg-amber-900/30 px-2 py-1 text-xs font-medium text-amber-300">
              Childless (+0.6% PV)
            </span>
          ) : null}
        </div>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Germany Standard Deductions
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Employee Lump-Sum (Pauschbetrag)
        </span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.standardDeductions.employeeLumpSum, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Special Expenses</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -
          {formatCurrency(
            breakdown.standardDeductions.specialExpensesLumpSum,
            currency,
          )}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
        <span className="text-sm text-zinc-300">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Germany Income Tax And Surcharges
      </p>
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.solidaritySurcharge > 0 ? (
        <DeductionRow
          label="Solidarity Surcharge (5.5%)"
          amount={taxes.solidaritySurcharge}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : (
        <p className="-mt-1 mb-1 text-xs italic text-emerald-500">
          Solidarity surcharge exempt (below threshold)
        </p>
      )}
      {taxes.churchTax > 0 ? (
        <DeductionRow
          label={`Church Tax (${(
            breakdown.personalInfo.churchTaxRate * 100
          ).toFixed(0)}%)`}
          amount={taxes.churchTax}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        German Social Security (Sozialversicherung)
      </p>
      <DeductionRow
        label="Pension Insurance (9.3%)"
        amount={taxes.pensionInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Health Insurance (7.3% + Zusatz)"
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Unemployment Insurance (1.3%)"
        amount={taxes.unemploymentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Long-term Care (${
          breakdown.personalInfo.isChildless ? "2.4%" : "1.8%"
        })`}
        amount={taxes.longTermCareInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer Social Security
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(employerSocialSecurity, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Employer pays this on top of your salary - not deducted from take-home
        pay.
      </p>

      {breakdown.voluntaryContributions.total > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Germany Voluntary Pension Contributions
          </p>
          {breakdown.voluntaryContributions.occupationalPension > 0 ? (
            <DeductionRow
              label="Occupational Pension (bAV)"
              amount={breakdown.voluntaryContributions.occupationalPension}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {breakdown.voluntaryContributions.riester > 0 ? (
            <DeductionRow
              label="Riester Pension"
              amount={breakdown.voluntaryContributions.riester}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {breakdown.voluntaryContributions.ruerup > 0 ? (
            <DeductionRow
              label="Ruerup (Basisrente)"
              amount={breakdown.voluntaryContributions.ruerup}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          <p className="mt-1 text-xs text-zinc-500">
            These contributions reduce taxable income in the calculator.
          </p>
        </>
      ) : null}

      <Separator className="my-2" />
      <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          Germany Salary Assumptions
        </p>
        <p className="text-xs text-zinc-500">
          Income tax uses progressive rates per §32a EStG. Solidarity surcharge
          applies only above the modeled threshold. Church tax applies when
          selected. Social security includes pension, health, unemployment, and
          long-term care insurance with employer matching shown separately.
        </p>
      </div>

      <ResultNotes countryName="Germany" sourceUrls={DE_SOURCE_URLS} />
    </>
  );
}
