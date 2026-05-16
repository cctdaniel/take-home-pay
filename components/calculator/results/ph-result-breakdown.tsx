import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function PHResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "PH" || breakdown.type !== "PH") {
    return null;
  }

  const hasSSS = taxes.sssEmployee > 0;
  const hasPhilHealth = taxes.philHealthEmployee > 0;
  const hasPagIbig = taxes.pagIbigEmployee > 0;

  return (
    <>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Income Tax (TRAIN)"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      {(hasSSS || hasPhilHealth || hasPagIbig) && (
        <Separator className="my-2" />
      )}

      {hasSSS && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">Social Security System</p>
          <DeductionRow
            label="SSS employee"
            amount={taxes.sssEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            MSC: {formatCurrency(breakdown.sss.msc, currency)}/month
            (range: {formatCurrency(breakdown.sss.minMsc, currency)}–{formatCurrency(breakdown.sss.maxMsc, currency)}).
            Rate: {formatPercentage(breakdown.sss.rate)}.
          </p>
        </>
      )}

      {hasPhilHealth && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">PhilHealth</p>
          <DeductionRow
            label="PhilHealth employee"
            amount={taxes.philHealthEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Base: {formatCurrency(breakdown.philHealth.monthlyBase, currency)}/month
            (floor {formatCurrency(breakdown.philHealth.floor)}, ceiling{" "}
            {formatCurrency(breakdown.philHealth.ceiling)}).
            Rate: {formatPercentage(breakdown.philHealth.rate)}.
          </p>
        </>
      )}

      {hasPagIbig && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">Pag-IBIG Fund</p>
          <DeductionRow
            label="Pag-IBIG employee"
            amount={taxes.pagIbigEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            MFS: {formatCurrency(breakdown.pagIbig.mfs, currency)}/month
            (ceiling {formatCurrency(breakdown.pagIbig.ceiling, currency)}).
            Rate: {formatPercentage(breakdown.pagIbig.rate)}.
          </p>
        </>
      )}

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">Exclusions</p>
        <p className="text-xs text-zinc-500">
          13th month pay (up to 90,000 PHP tax-exempt), de minimis benefits,
          employer SSS/PhilHealth/Pag-IBIG contributions, self-employment,
          and mixed-income earner rules are not modeled.
        </p>
      </div>
    </>
  );
}
