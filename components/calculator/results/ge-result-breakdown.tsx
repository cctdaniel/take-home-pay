import { Separator } from "@/components/ui/separator";
import { GE_SOURCE_URLS } from "@/lib/countries/ge/constants/tax-brackets-2026";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function GEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "GE" || breakdown.type !== "GE") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Income Regime</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.incomeRegime === "small_business"
            ? "IE small business"
            : breakdown.incomeRegime === "micro_business"
              ? "Micro business"
              : "Employment salary"}
        </span>
      </div>

      {breakdown.incomeRegime === "employment" ? (
        <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Residency</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.residencyType === "resident" ? "Resident" : "Non-resident"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Funded Pension</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.isPensionParticipant ? "Enrolled" : "Not participating"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Salary</span>
        <span className="tabular-nums text-sm text-zinc-200">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
        </>
      ) : (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Taxable Business Income</span>
          <span className="tabular-nums text-sm text-zinc-200">
            {formatCurrency(result.taxableIncome, currency)}
          </span>
        </div>
      )}

      <Separator className="my-2" />

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        {breakdown.incomeRegime === "employment"
          ? "Income Tax"
          : "Business Income Tax"}
      </p>
      <DeductionRow
        label={
          breakdown.incomeRegime === "small_business"
            ? `Small Business Tax (${(breakdown.incomeTax.rate * 100).toFixed(2)}% effective)`
            : breakdown.incomeRegime === "micro_business" &&
                !breakdown.businessRegime.microBusinessLimitExceeded
              ? "Micro Business Income Tax (0%)"
              : `Income Tax (${(breakdown.incomeTax.rate * 100).toFixed(0)}%)`
        }
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      {breakdown.incomeRegime === "small_business" ? (
        <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
          <p className="mb-1 text-xs font-medium text-zinc-400">
            Small Business Threshold
          </p>
          <div className="space-y-1 text-xs text-zinc-500">
            <div className="flex justify-between gap-4">
              <span>
                Income at {(breakdown.businessRegime.standardRate * 100).toFixed(0)}%
              </span>
              <span className="tabular-nums">
                {formatCurrency(
                  breakdown.businessRegime.standardRateIncome,
                  currency,
                )}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>
                Income at {(breakdown.businessRegime.overLimitRate * 100).toFixed(0)}%
              </span>
              <span className="tabular-nums">
                {formatCurrency(
                  breakdown.businessRegime.overLimitRateIncome,
                  currency,
                )}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {breakdown.incomeRegime === "micro_business" &&
      breakdown.businessRegime.microBusinessLimitExceeded ? (
        <p className="mt-2 text-xs italic text-amber-300">
          The entered income exceeds the micro business limit of{" "}
          {formatCurrency(
            breakdown.businessRegime.microBusinessIncomeLimit,
            currency,
          )}
          , so ordinary 20% income tax is applied in this model.
        </p>
      ) : null}

      {breakdown.isPensionParticipant ? (
        <>
          <Separator className="my-2" />

          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Funded Pension
          </p>
          <DeductionRow
            label={`Employee Contribution (${(
              breakdown.pension.employeeRate * 100
            ).toFixed(0)}%)`}
            amount={taxes.pensionEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <div className="flex items-center justify-between py-2 opacity-60">
            <span className="text-sm text-zinc-400">
              Employer Contribution ({(breakdown.pension.employerRate * 100).toFixed(0)}%)
            </span>
            <span className="tabular-nums text-sm text-zinc-500">
              +{formatCurrency(breakdown.pension.employer, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 opacity-60">
            <span className="text-sm text-zinc-400">
              State Contribution (2% / 1% bands)
            </span>
            <span className="tabular-nums text-sm text-zinc-500">
              +{formatCurrency(breakdown.pension.state, currency)}
            </span>
          </div>
          <p className="text-xs italic text-zinc-500">
            Employer and state contributions go to the pension account and are
            not deducted from take-home pay.
          </p>

          <Separator className="my-2" />
          <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-1 text-xs font-medium text-zinc-400">
              State Pension Salary Bracket
            </p>
            <div className="space-y-1 text-xs text-zinc-500">
              <div className="flex justify-between gap-4">
                <span>
                  Up to{" "}
                  {formatCurrency(
                    breakdown.pension.stateFirstBandLimit,
                    currency,
                  )}
                </span>
                <span className="tabular-nums text-right">
                  {formatCurrency(
                    breakdown.pension.stateFirstBandContributionSalary,
                    currency,
                  )}{" "}
                  at {(breakdown.pension.stateFirstBandRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>
                  Over {formatCurrency(breakdown.pension.stateFirstBandLimit, currency)} to{" "}
                  {formatCurrency(
                    breakdown.pension.stateSecondBandLimit,
                    currency,
                  )}
                </span>
                <span className="tabular-nums text-right">
                  {formatCurrency(
                    breakdown.pension.stateSecondBandContributionSalary,
                    currency,
                  )}{" "}
                  at {(breakdown.pension.stateSecondBandRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>
                  Over{" "}
                  {formatCurrency(
                    breakdown.pension.stateSecondBandLimit,
                    currency,
                  )}
                </span>
                <span className="tabular-nums">
                  {(breakdown.pension.stateAboveSecondBandRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-1 text-zinc-400">
                <span>Total annual pension account inflow</span>
                <span className="tabular-nums">
                  {formatCurrency(
                    breakdown.pension.totalAccountContribution,
                    currency,
                  )}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <Separator className="my-2" />
      <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          Modeled Scope
        </p>
        <p className="text-xs leading-relaxed text-zinc-500">
          {breakdown.incomeRegime === "employment"
            ? "Ordinary employment salary with funded pension participation where selected. Use the income-regime selector for individual entrepreneur scenarios."
            : "Individual entrepreneur special tax treatment is modeled for the selected regime. Activity eligibility, VAT registration, monthly filing penalties, and self-employed voluntary pension mechanics are outside this annual take-home result."}
        </p>
      </div>
      <ResultNotes
        countryName="Georgia"
        assumptions={[
          "Employment salary uses the ordinary 20% income tax rate and funded pension participation where selected.",
          "The income-regime selector separately models micro and small individual-entrepreneur scenarios instead of mixing them into ordinary payroll.",
          "Employer and state pension contributions are account inflows and are not deducted from cash take-home pay.",
        ]}
        exclusions={[
          "Activity eligibility for micro or small business status, VAT registration, monthly filing penalties, bookkeeping compliance, self-employed voluntary pension mechanics, and special personal exemptions require separate facts.",
        ]}
        sourceUrls={GE_SOURCE_URLS}
      />
    </>
  );
}
