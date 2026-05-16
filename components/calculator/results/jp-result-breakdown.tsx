import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function JPResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "JP" || breakdown.type !== "JP") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Employment income deduction</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {formatCurrency(breakdown.employmentIncomeDeduction, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">National Income Tax</p>
      <DeductionRow
        label="National income tax"
        amount={breakdown.nationalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Reconstruction surtax (2.1%)"
        amount={taxes.reconstructionSurtax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Resident Tax</p>
      <DeductionRow
        label="Resident tax (10%)"
        amount={taxes.residentTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Flat 10% on taxable income after basic deduction of {formatCurrency(480000, currency)}.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Insurance</p>
      <DeductionRow
        label={`Pension (${formatPercentage(breakdown.socialInsurance.pension.rate)})`}
        amount={taxes.pensionInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Health insurance (${formatPercentage(breakdown.socialInsurance.health.rate)})`}
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Employment insurance (${formatPercentage(breakdown.socialInsurance.employment.rate)})`}
        amount={taxes.employmentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">Exclusions</p>
        <p className="text-xs text-zinc-500">
          Spousal deduction, dependent deductions, local inhabitant tax
          variations, employer social insurance contributions, and employer
          benefits are not modeled.
        </p>
      </div>
    </>
  );
}
