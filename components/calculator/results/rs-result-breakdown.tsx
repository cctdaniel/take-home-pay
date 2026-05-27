import { Separator } from "@/components/ui/separator";
import { isRSBreakdown, isRSTaxBreakdown } from "@/lib/countries/rs/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
  variant = "deduction",
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
  variant?: "deduction" | "credit" | "plain";
}) {
  if (amount <= 0) {
    return null;
  }

  const valueClass =
    variant === "plain" ? "text-zinc-300" : "text-emerald-400";
  const prefix = variant === "plain" ? "" : "-";

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-sm tabular-nums ${valueClass}`}>
        {prefix}
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function RSResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isRSTaxBreakdown(taxes) || !isRSBreakdown(breakdown)) {
    return null;
  }

  const salaryTaxBaseReduction = breakdown.deductions.find(
    (deduction) =>
      deduction.name === "Newly settled taxpayer 70% salary-tax base reduction",
  );
  const payrollContributions = breakdown.mandatoryContributions.filter(
    (contribution) =>
      contribution.name !== "Supplementary annual PIT after selected AIF credit",
  );
  const annualPit = breakdown.mandatoryContributions.find(
    (contribution) =>
      contribution.name === "Supplementary annual PIT after selected AIF credit",
  );
  const hasAnnualPitInputs =
    breakdown.annualPitInputs.includeAnnualPersonalIncomeTax ||
    breakdown.annualPitInputs.alternativeInvestmentFundInvestment > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Serbia cash salary</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      {(breakdown.taxableNonCashBenefits ?? 0) > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Taxable fringe benefits
          </span>
          <span className="text-sm text-amber-300 tabular-nums">
            +{formatCurrency(breakdown.taxableNonCashBenefits ?? 0, currency)}
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Salary tax / contribution gross base
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(
            breakdown.taxableGrossIncome ?? breakdown.grossIncome,
            currency,
          )}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Salary tax taxable base
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {(breakdown.personalAllowance > 0 ||
        (salaryTaxBaseReduction?.amount ?? 0) > 0) && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Serbia Payroll Reliefs
          </p>
          <ReliefRow
            label={breakdown.personalAllowanceName ?? "Monthly salary allowance"}
            amount={breakdown.personalAllowance}
            currency={currency}
          />
          <ReliefRow
            label="Newly settled taxpayer base reduction"
            amount={salaryTaxBaseReduction?.amount ?? 0}
            currency={currency}
          />
          {breakdown.newlySettledReliefInput !== "none" &&
          (salaryTaxBaseReduction?.amount ?? 0) <= 0 ? (
            <p className="text-xs italic text-zinc-500">
              Newly settled relief was selected, but the selected 2026 monthly
              salary threshold is not met.
            </p>
          ) : null}
        </>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Salary Tax And Employee Contributions
      </p>
      <DeductionRow
        label="Serbia salary tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.bracketTaxes.length > 0 ? (
        <div className="space-y-1 pt-1">
          {breakdown.bracketTaxes.map((bracket) => (
            <div
              className="flex items-center justify-between py-1"
              key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
            >
              <span className="text-xs text-zinc-500">
                {formatPercentage(bracket.rate)} salary tax band above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {payrollContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={`${contribution.name} (${formatPercentage(contribution.rate)})`}
          amount={contribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}

      {hasAnnualPitInputs ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Supplementary Annual PIT Estimate
          </p>
          <ReliefRow
            label="Net annual employment income tested"
            amount={breakdown.annualPitDetails.netAnnualEmploymentIncome}
            currency={currency}
            variant="plain"
          />
          <ReliefRow
            label="Under-40 annual PIT reduction"
            amount={breakdown.annualPitDetails.under40Reduction}
            currency={currency}
          />
          <ReliefRow
            label="Annual PIT non-taxable threshold"
            amount={breakdown.annualPitDetails.annualPitThreshold}
            currency={currency}
          />
          <ReliefRow
            label="Taxpayer and dependent deductions"
            amount={breakdown.annualPitDetails.personalDeductions}
            currency={currency}
          />
          <ReliefRow
            label="Alternative investment fund credit"
            amount={breakdown.annualPitDetails.alternativeInvestmentFundCredit}
            currency={currency}
            variant="credit"
          />
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Annual PIT taxable base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.annualPitDetails.annualTaxBase, currency)}
            </span>
          </div>
          <DeductionRow
            label="Supplementary annual PIT"
            amount={annualPit?.amount ?? breakdown.annualPitDetails.annualTax}
            grossSalary={grossSalary}
            currency={currency}
          />
          {breakdown.annualPitDetails.alternativeInvestmentFundInvestment > 0 ? (
            <p className="text-xs italic text-zinc-500">
              AIF investment entered:{" "}
              {formatCurrency(
                breakdown.annualPitDetails.alternativeInvestmentFundInvestment,
                currency,
              )}
              . Credit is limited to 50% of the investment and 50% of annual PIT
              before the credit.
            </p>
          ) : null}
        </>
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Serbia Salary Assumptions
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {breakdown.modeledExclusions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Serbia Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Serbia" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
