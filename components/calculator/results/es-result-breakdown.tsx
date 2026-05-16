import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function ESResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "ES" || breakdown.type !== "ES") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident
            ? "Spanish Resident (IRPF)"
            : breakdown.residencyType === "non_resident_eu_eea"
              ? "Non-Resident EU/EEA (19% IRNR)"
              : "Non-Resident Other (24% IRNR)"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Region</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.regionName}
        </span>
      </div>

      {breakdown.isResident && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Taxable Income Adjustments
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Employee Social Security
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(taxes.socialSecurity, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Employment Expense Deduction
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.workExpenseDeduction, currency)}
            </span>
          </div>
          {breakdown.jointTaxationReduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Joint Return Reduction
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.jointTaxationReduction, currency)}
              </span>
            </div>
          )}
          {breakdown.voluntaryContributions.pensionContribution > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Pension Plan Contribution
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.voluntaryContributions.pensionContribution,
                  currency,
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
            <span className="text-sm text-zinc-300">Taxable Income</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableIncome, currency)}
            </span>
          </div>
        </>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        {breakdown.isResident ? "IRPF Income Tax" : "IRNR Income Tax"}
      </p>

      {breakdown.isResident ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Personal & Family Minimum
            </span>
            <span className="text-sm text-zinc-300 tabular-nums">
              {formatCurrency(breakdown.personalFamilyMinimum, currency)}
            </span>
          </div>
          {breakdown.minimumTaxCredit > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Minimum Tax Credit</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.minimumTaxCredit, currency)}
              </span>
            </div>
          )}
          <DeductionRow
            label="State IRPF"
            amount={taxes.stateIncomeTax}
            grossSalary={grossSalary}
            currency={currency}
          />
          <DeductionRow
            label={`${breakdown.regionName} IRPF`}
            amount={taxes.regionalIncomeTax}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : (
        <DeductionRow
          label={`IRNR (${formatPercentage(breakdown.nonResidentRate ?? 0)})`}
          amount={taxes.incomeTax}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Social Security (Employee)
      </p>
      <p className="text-xs text-zinc-500 mb-1">
        Contribution base floored at{" "}
        {formatCurrency(breakdown.socialSecurity.monthlyBaseMin, currency)}
        /month and capped at{" "}
        {formatCurrency(breakdown.socialSecurity.monthlyBaseMax, currency)}
        /month for full-year employee estimates.
      </p>
      <DeductionRow
        label="Common Contingencies (4.70%)"
        amount={breakdown.socialSecurity.commonContingencies}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Unemployment (${formatPercentage(
          breakdown.socialSecurity.unemploymentRate,
        )})`}
        amount={breakdown.socialSecurity.unemployment}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Training (0.10%)"
        amount={breakdown.socialSecurity.training}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="MEI (0.15%)"
        amount={breakdown.socialSecurity.mei}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.socialSecurity.solidarity > 0 && (
        <DeductionRow
          label="Solidarity Contribution"
          amount={breakdown.socialSecurity.solidarity}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}

      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer Social Security
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.socialSecurity.employer, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer amount excludes sector-specific accident premiums and is not
        deducted from take-home pay.
      </p>

      {breakdown.voluntaryContributions.pensionContribution > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Voluntary Contributions
          </p>
          <DeductionRow
            label="Pension Plan Contribution"
            amount={breakdown.voluntaryContributions.pensionContribution}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      )}

      <Separator className="my-2" />
      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-1">
          Spain Assumptions
        </p>
        <p className="text-xs text-zinc-500">
          Uses {breakdown.assumptions.irpfRateYear} AEAT IRPF scales and{" "}
          {breakdown.assumptions.socialSecurityYear} payroll contribution rates.
          Regional deductions and Basque/Navarre foral regimes are not included.
        </p>
      </div>
    </>
  );
}
