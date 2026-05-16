import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function HRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "HR" || breakdown.type !== "HR") {
    return null;
  }

  const isPensionCapped =
    grossSalary > breakdown.pension.annualBaseCeiling &&
    breakdown.pension.contributionBase === breakdown.pension.annualBaseCeiling;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident ? "Croatian Tax Resident" : "Non-Resident"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Local Tax Rate</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.locality.name} (
          {formatPercentage(breakdown.locality.lowerRate)} /{" "}
          {formatPercentage(breakdown.locality.higherRate)})
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
        label="Croatian Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      {breakdown.personalAllowance.total > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Basic Personal Allowance
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.personalAllowance.basic, currency)}
            </span>
          </div>
          {breakdown.personalAllowance.dependentSpouse > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Dependent Spouse Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.personalAllowance.dependentSpouse,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.personalAllowance.children > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Dependent Child Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.personalAllowance.children, currency)}
              </span>
            </div>
          )}
        </div>
      )}

      <Separator className="my-2" />

      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Employee Pension Contributions
      </p>
      <DeductionRow
        label={`I Pillar (${formatPercentage(
          breakdown.pension.firstPillarRate,
        )})`}
        amount={taxes.employeePensionFirstPillar}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.employeePensionSecondPillar > 0 && (
        <DeductionRow
          label={`II Pillar (${formatPercentage(
            breakdown.pension.secondPillarRate,
          )})`}
          amount={taxes.employeePensionSecondPillar}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      {isPensionCapped && (
        <p className="text-xs text-zinc-500 italic mt-1">
          Pension contributions are capped at{" "}
          {formatCurrency(breakdown.pension.monthlyBaseCeiling, currency)} per
          month.
        </p>
      )}

      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer Health Insurance (
          {formatPercentage(breakdown.employerContributions.healthInsuranceRate)}
          )
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +
          {formatCurrency(
            breakdown.employerContributions.healthInsurance,
            currency,
          )}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer health insurance is paid on top of gross salary and is not
        deducted from take-home pay.
      </p>

      <Separator className="my-2" />
      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-1">
          Modeled Exclusions
        </p>
        <p className="text-xs text-zinc-500">
          {breakdown.modeledExclusions.join("; ")}.
        </p>
      </div>
    </>
  );
}
