import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function MTResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "MT" || breakdown.type !== "MT") {
    return null;
  }

  const hasIncomeDeductions = breakdown.incomeDeductions.total > 0;
  const hasTaxCredits = breakdown.taxCredits.total > 0;
  const hasVoluntaryContributions = breakdown.voluntaryContributions.total > 0;
  const employerTotal =
    breakdown.socialSecurity.employerAnnual +
    breakdown.socialSecurity.maternityLeaveFundAnnual;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Schedule</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.taxScheduleName}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Chargeable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasIncomeDeductions && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Income Deductions
          </p>
          {breakdown.incomeDeductions.employmentIncomeDeduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Employment Income Deduction
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.incomeDeductions.employmentIncomeDeduction,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.incomeDeductions.schoolFees > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">School Fees</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.incomeDeductions.schoolFees, currency)}
              </span>
            </div>
          )}
          {breakdown.incomeDeductions.childcareFees > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Childcare Fees</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.incomeDeductions.childcareFees,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.incomeDeductions.sportsFees > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Sports Fees</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.incomeDeductions.sportsFees, currency)}
              </span>
            </div>
          )}
          {breakdown.incomeDeductions.culturalFees > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Cultural Course Fees</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.incomeDeductions.culturalFees,
                  currency,
                )}
              </span>
            </div>
          )}
        </>
      )}

      <Separator className="my-2" />

      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {hasTaxCredits && (
        <div className="rounded-lg bg-zinc-800/50 p-3 mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Gross Income Tax</span>
            <span className="text-sm text-zinc-300 tabular-nums">
              {formatCurrency(breakdown.taxCredits.grossIncomeTax, currency)}
            </span>
          </div>
          {breakdown.taxCredits.personalRetirementScheme > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">PRS Tax Credit</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.taxCredits.personalRetirementScheme,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.taxCredits.voluntaryOccupationalPension > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">VOPS Tax Credit</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.taxCredits.voluntaryOccupationalPension,
                  currency,
                )}
              </span>
            </div>
          )}
        </div>
      )}

      <Separator className="my-2" />

      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Class 1 Social Security
      </p>
      <DeductionRow
        label={`Employee SSC Category ${breakdown.socialSecurity.category}`}
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer SSC + Maternity Fund
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(employerTotal, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer amounts are paid on top of salary and are not deducted from
        take-home pay.
      </p>

      {hasVoluntaryContributions && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Voluntary Contributions
          </p>
          {breakdown.voluntaryContributions.personalRetirementScheme > 0 && (
            <DeductionRow
              label="Personal Retirement Scheme"
              amount={breakdown.voluntaryContributions.personalRetirementScheme}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryContributions.voluntaryOccupationalPension >
            0 && (
            <DeductionRow
              label="Voluntary Occupational Pension"
              amount={
                breakdown.voluntaryContributions.voluntaryOccupationalPension
              }
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}

      <Separator className="my-2" />
      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-1">
          Malta Model Notes
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
            {breakdown.isResident ? "Resident" : "Non-resident"}
          </span>
          <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
            Weekly wage {formatCurrency(breakdown.socialSecurity.basicWeeklyWage, currency)}
          </span>
          <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
            Adult Class 1 SSC
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Ordinary employment only. Nomad Residence Permit authorised work,
          special tax statuses, part-time final tax, qualifying overtime, and
          under-18 or apprentice SSC categories are excluded.
        </p>
      </div>
    </>
  );
}
