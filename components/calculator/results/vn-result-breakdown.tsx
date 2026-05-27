import { Separator } from "@/components/ui/separator";
import { VN_SOURCE_URLS } from "@/lib/countries/vn/constants/tax-parameters-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function VNResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "VN" || breakdown.type !== "VN") {
    return null;
  }

  const hasDependents = breakdown.numberOfDependents > 0;
  const hasVoluntaryDeductions = breakdown.voluntaryDeductions.total > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">
          Taxable Income Deductions
        </span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {formatCurrency(breakdown.totalDeductions, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Personal: {formatCurrency(breakdown.personalDeduction, currency)}
        {hasDependents && ` + Dependents (${breakdown.numberOfDependents}): ${formatCurrency(breakdown.dependentDeduction, currency)}`}
        {hasVoluntaryDeductions &&
          ` + Voluntary: ${formatCurrency(breakdown.voluntaryDeductions.total, currency)}`}
      </p>
      <p className="mt-1 text-xs italic text-zinc-500">
        {breakdown.residencyStatus === "resident"
          ? "Resident progressive PIT"
          : "Non-resident 20% employment income tax"}
        {" · "}
        {breakdown.insuranceCoverage === "vietnameseEmployee"
          ? "Vietnamese employee insurance coverage"
          : breakdown.insuranceCoverage === "foreignCovered"
            ? "Foreign employee SI + HI coverage"
            : "Payroll insurance exempt/not covered"}
      </p>

      {hasVoluntaryDeductions && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Voluntary Tax Deductions
          </p>
          {breakdown.voluntaryDeductions.voluntaryPensionContribution > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Voluntary pension contribution
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.voluntaryDeductions.voluntaryPensionContribution,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.voluntaryDeductions.charitableDonations > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Approved charity / humanitarian contributions
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.voluntaryDeductions.charitableDonations,
                  currency,
                )}
              </span>
            </div>
          )}
        </>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Insurance</p>
      <DeductionRow
        label={`Social insurance (${formatPercentage(breakdown.socialInsurance.rate)})`}
        amount={taxes.socialInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Health insurance (${formatPercentage(breakdown.healthInsurance.rate)})`}
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Unemployment insurance (${formatPercentage(breakdown.unemploymentInsurance.rate)})`}
        amount={taxes.unemploymentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Social and health insurance ceiling: 20× base salary (
        {formatCurrency(breakdown.socialInsurance.ceiling, currency)}/month).
        Unemployment insurance applies only to Vietnamese employee coverage.
      </p>

      <ResultNotes
        countryName="Vietnam"
        assumptions={[
          "Resident salary uses Vietnam progressive PIT with personal and dependent deductions; non-resident salary uses the flat employment-income rate.",
          "Social, health, and unemployment insurance follow the selected employee coverage mode and modeled monthly salary ceilings.",
        ]}
        exclusions={[
          "Employer social, health, and unemployment insurance contributions are employer costs. Trade union fees, business income, irregular income, treaty positions, and special salary exemptions need separate return or legal facts. Law 109 healthcare and education-training expense deductions require Government-specified implementing levels before this salary page can calculate them.",
        ]}
        sourceUrls={VN_SOURCE_URLS}
      />
    </>
  );
}
