import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function CYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "CY" || breakdown.type !== "CY") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident ? "Cyprus Resident" : "Non-Resident"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Chargeable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Taxable Income Deductions</p>
      {breakdown.deductions.homeInsurance > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Home Insurance</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.homeInsurance, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.contributionGroupDeduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            SI, GHS, Pension/Provident Deduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.deductions.contributionGroupDeduction,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.deductions.childDeduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Dependent Children</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.childDeduction, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.primaryResidence > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Primary Residence</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.primaryResidence, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.greenTransition > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Green / EV Expense</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.greenTransition, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.disallowedContributionDeduction > 0 && (
        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">
          {formatCurrency(
            breakdown.deductions.disallowedContributionDeduction,
            currency,
          )} of SI, GHS, pension/provident, medical, and life-insurance
          deductions is over the TD59 one-fifth aggregate deduction cap.
        </p>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Social Insurance</p>
      <p className="text-xs text-zinc-500 mb-1">
        Employee Social Insurance is capped at {" "}
        {formatCurrency(breakdown.socialInsurance.monthlyCeiling, currency)}
        /month for this annual salary estimate.
      </p>
      <DeductionRow
        label={`Employee SI (${formatPercentage(
          breakdown.socialInsurance.employeeRate,
        )})`}
        amount={taxes.socialInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer SI ({formatPercentage(breakdown.socialInsurance.employerRate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.socialInsurance.employer, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1 opacity-60">
        <span className="text-sm text-zinc-400">
          State SI ({formatPercentage(breakdown.socialInsurance.stateRate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.socialInsurance.state, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">General Healthcare System</p>
      <DeductionRow
        label={`Employee GHS (${formatPercentage(breakdown.gesy.employeeRate)})`}
        amount={taxes.gesy}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer GHS ({formatPercentage(breakdown.gesy.employerRate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.gesy.employer, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer and state amounts are informational and are not deducted from
        take-home pay.
      </p>

      {breakdown.voluntaryContributions.total > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Voluntary Contributions
          </p>
          <DeductionRow
            label="Approved Pension / Provident Fund"
            amount={breakdown.voluntaryContributions.approvedPensionProvidentFund}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      )}

      <Separator className="my-2" />
      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-1">
          Cyprus Assumptions
        </p>
        <p className="text-xs text-zinc-500">
          Family reliefs are applied only when the income-criteria option is
          eligible. The calculator excludes first-employment exemptions,
          life-insurance capital-sum tests, medical funds, non-salary income,
          and Special Defence Contribution.
        </p>
      </div>
    </>
  );
}
