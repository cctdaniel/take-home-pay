import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function GRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "GR" || breakdown.type !== "GR") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident ? "Greek Tax Resident" : "Non-Resident"}
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
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.incomeTax.appliedTaxReduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Employment Tax Reduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.incomeTax.appliedTaxReduction,
              currency,
            )}
          </span>
        </div>
      )}

      <Separator className="my-2" />

      <p className="text-xs text-zinc-500 pt-2 pb-1">
        e-EFKA Social Insurance
      </p>
      <DeductionRow
        label={`Employee Contribution (${(
          breakdown.socialInsurance.employeeRate * 100
        ).toFixed(2)}%)`}
        amount={taxes.socialInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer Contribution (
          {(breakdown.socialInsurance.employerRate * 100).toFixed(2)}%)
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.socialInsurance.employer, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer pays this on top of your salary and is not deducted from
        take-home pay.
      </p>

      <Separator className="my-2" />
      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-1">
          Taxpayer Information
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
            Age {breakdown.age}
          </span>
          {breakdown.numberOfDependents > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
              {breakdown.numberOfDependents} dependent child
              {breakdown.numberOfDependents > 1 ? "ren" : ""}
            </span>
          )}
          {breakdown.age <= 30 && breakdown.isResident && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
              Youth rates applied
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Employee e-EFKA contributions are deducted before income tax. The
          insurable earnings ceiling is{" "}
          {formatCurrency(breakdown.socialInsurance.monthlyCeiling, currency)}
          per payment across {breakdown.socialInsurance.salaryInstallments}{" "}
          statutory salary payments.
        </p>
      </div>
    </>
  );
}
