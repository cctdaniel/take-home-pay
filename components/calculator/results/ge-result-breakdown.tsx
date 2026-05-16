import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
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

      <Separator className="my-2" />

      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label={`Salary Income Tax (${(breakdown.incomeTax.rate * 100).toFixed(0)}%)`}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

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
              State Contribution ({(breakdown.pension.stateRate * 100).toFixed(0)}%)
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
                <span className="tabular-nums">
                  {(breakdown.pension.stateFirstBandRate * 100).toFixed(0)}%
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
                <span className="tabular-nums">
                  {(breakdown.pension.stateSecondBandRate * 100).toFixed(0)}%
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
          Ordinary employment salary only. Small business, micro business,
          individual entrepreneur, and self-employed pension regimes are
          excluded from this result.
        </p>
      </div>
    </>
  );
}
