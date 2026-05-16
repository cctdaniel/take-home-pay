import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function CZResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "CZ" || breakdown.type !== "CZ") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.isResident ? "Czech Tax Resident" : "Non-Resident"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Rounded Tax Base</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />

      <p className="pt-2 pb-1 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Income Tax After Credits"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Tax Before Credits</span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.incomeTax.grossIncomeTax, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Basic Taxpayer Credit</span>
        <span className="text-sm tabular-nums text-emerald-400">
          -{formatCurrency(breakdown.taxCredits.basicTaxpayerCredit, currency)}
        </span>
      </div>
      {breakdown.taxCredits.spouseCredit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Spouse Credit</span>
          <span className="text-sm tabular-nums text-emerald-400">
            -{formatCurrency(breakdown.taxCredits.spouseCredit, currency)}
          </span>
        </div>
      )}
      {breakdown.taxCredits.childCredit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Child Tax Credit</span>
          <span className="text-sm tabular-nums text-emerald-400">
            -{formatCurrency(breakdown.taxCredits.childCreditAgainstTax, currency)}
          </span>
        </div>
      )}
      {taxes.childTaxBonus > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Refundable Child Bonus</span>
          <span className="text-sm tabular-nums text-emerald-400">
            +{formatCurrency(taxes.childTaxBonus, currency)}
          </span>
        </div>
      )}

      <Separator className="my-2" />

      <p className="pt-2 pb-1 text-xs text-zinc-500">
        Statutory Employee Contributions
      </p>
      <DeductionRow
        label={`Social Security (${(
          breakdown.socialSecurity.employeeRate * 100
        ).toFixed(1)}%)`}
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-1 pl-4">
        <span className="text-xs text-zinc-500">Pension insurance</span>
        <span className="text-xs tabular-nums text-zinc-500">
          {formatCurrency(breakdown.socialSecurity.pensionEmployee, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1 pl-4">
        <span className="text-xs text-zinc-500">Sickness insurance</span>
        <span className="text-xs tabular-nums text-zinc-500">
          {formatCurrency(breakdown.socialSecurity.sicknessEmployee, currency)}
        </span>
      </div>
      <DeductionRow
        label={`Health Insurance (${(
          breakdown.healthInsurance.employeeRate * 100
        ).toFixed(1)}%)`}
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />

      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">Employer Social Security</span>
        <span className="text-sm tabular-nums text-zinc-500">
          +{formatCurrency(breakdown.socialSecurity.employer, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">Employer Health Insurance</span>
        <span className="text-sm tabular-nums text-zinc-500">
          +{formatCurrency(breakdown.healthInsurance.employer, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Employer contributions are paid on top of gross salary and are not
        deducted from take-home pay.
      </p>

      {breakdown.deductions.total > 0 && (
        <>
          <Separator className="my-2" />
          <p className="pt-2 pb-1 text-xs text-zinc-500">
            Modeled Tax-Deductible Amounts
          </p>
          {breakdown.deductions.retirementSavings > 0 && (
            <DeductionRow
              label="Retirement Products"
              amount={breakdown.deductions.retirementSavings}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.deductions.charitableDonations > 0 && (
            <DeductionRow
              label="Charitable Gifts"
              amount={breakdown.deductions.charitableDonations}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}

      <Separator className="my-2" />
      <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          Czech Payroll Notes
        </p>
        <p className="text-xs text-zinc-500">
          The higher 23% income tax band starts above{" "}
          {formatCurrency(breakdown.incomeTax.taxBandThreshold, currency)} of
          annual taxable income. Social security is capped at{" "}
          {formatCurrency(breakdown.socialSecurity.annualCeiling, currency)} of
          annual assessment base; public health insurance has no modeled ceiling.
        </p>
      </div>
    </>
  );
}
