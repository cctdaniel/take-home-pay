import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function AEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "AE" || breakdown.type !== "AE") {
    return null;
  }

  const hasPension = taxes.pensionEmployee > 0;
  const hasEmployerPension = breakdown.pension.employer > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Employee Category</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.employeeCategoryLabel}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="UAE Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Salary and wage income is modeled with no UAE personal income tax.
      </p>

      {hasPension ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Pension / Social Security
          </p>
          <p className="mb-2 text-xs text-zinc-400">
            Employee rate {formatPercentage(breakdown.pension.employeeRate)} on
            {" "}
            {formatCurrency(
              breakdown.pension.contributionSalaryMonthly,
              currency,
            )}
            /month contribution salary.
          </p>
          <DeductionRow
            label="Employee pension"
            amount={taxes.pensionEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          {breakdown.pension.monthlyMaximum !== undefined &&
            grossSalary / 12 > breakdown.pension.monthlyMaximum && (
              <p className="-mt-1 mb-1 text-xs italic text-zinc-500">
                Contribution salary capped at{" "}
                {formatCurrency(breakdown.pension.monthlyMaximum, currency)}
                /month.
              </p>
            )}
          {hasEmployerPension && (
            <div className="flex items-center justify-between py-2 opacity-60">
              <span className="text-sm text-zinc-400">
                Employer pension ({formatPercentage(breakdown.pension.employerRate)})
              </span>
              <span className="text-sm tabular-nums text-zinc-500">
                +{formatCurrency(breakdown.pension.employer, currency)}
              </span>
            </div>
          )}
          {breakdown.pension.governmentSupport > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">
                Government support ({formatPercentage(breakdown.pension.governmentSupportRate)})
              </span>
              <span className="text-sm tabular-nums text-zinc-500">
                +{formatCurrency(breakdown.pension.governmentSupport, currency)}
              </span>
            </div>
          )}
          <p className="text-xs italic text-zinc-500">
            Employer and government amounts are informational and are not
            deducted from take-home pay.
          </p>
        </>
      ) : (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-400">
            No UAE employee pension deduction is modeled for foreign / expat
            employees.
          </div>
        </>
      )}

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          Exclusions
        </p>
        <p className="text-xs text-zinc-500">
          Visa/free-zone costs, corporate or self-employment tax positions,
          end-of-service gratuity, unemployment insurance, medical insurance,
          employer benefits, and detailed GCC salary-component caps are not
          modeled.
        </p>
      </div>
    </>
  );
}
