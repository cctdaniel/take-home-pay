import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
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

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Deductions</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {formatCurrency(breakdown.totalDeductions, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Personal: {formatCurrency(breakdown.personalDeduction, currency)}
        {hasDependents && ` + Dependents (${breakdown.numberOfDependents}): ${formatCurrency(breakdown.dependentDeduction, currency)}`}
      </p>

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
        Contribution ceiling: 20× base salary ({formatCurrency(breakdown.socialInsurance.ceiling, currency)}/month).
      </p>

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">Exclusions</p>
        <p className="text-xs text-zinc-500">
          Employer social/health/unemployment insurance contributions, trade
          union fees, business income, irregular income, and expatriate tax
          rules are not modeled.
        </p>
      </div>
    </>
  );
}
