import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function INResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "IN" || breakdown.type !== "IN") {
    return null;
  }

  const hasEpf = taxes.epfEmployee > 0;
  const hasSurcharge = taxes.surcharge > 0;
  const hasRebate = breakdown.rebateUnder87A > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Regime</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.regime === "new" ? "New Regime" : "Old Regime"}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Income tax"
        amount={breakdown.grossTax > 0 ? breakdown.grossTax : 0}
        grossSalary={grossSalary}
        currency={currency}
      />
      {hasRebate && (
        <div className="flex items-center justify-between py-1 opacity-60">
          <span className="text-sm text-zinc-400">Section 87A Rebate</span>
          <span className="text-sm tabular-nums text-green-400">
            −{formatCurrency(breakdown.rebateUnder87A, currency)}
          </span>
        </div>
      )}
      <DeductionRow
        label={`Cess (${formatPercentage(0.04)})`}
        amount={taxes.cess}
        grossSalary={grossSalary}
        currency={currency}
      />
      {hasSurcharge && (
        <DeductionRow
          label="Surcharge"
          amount={taxes.surcharge}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      <p className="mt-1 text-xs italic text-zinc-500">
        Standard deduction: {formatCurrency(breakdown.standardDeduction, currency)}/year.
      </p>

      {hasEpf && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">Provident Fund</p>
          <DeductionRow
            label={`EPF employee (${formatPercentage(breakdown.epf.rate)})`}
            amount={taxes.epfEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Wage ceiling: {formatCurrency(breakdown.epf.ceiling, currency)}/month.
          </p>
        </>
      )}

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">Exclusions</p>
        <p className="text-xs text-zinc-500">
          NPS contributions, professional tax, Section 80 deductions (old
          regime), employer EPF/EPS contributions, gratuity, medical
          insurance, and state-level taxes are not modeled.
        </p>
      </div>
    </>
  );
}
