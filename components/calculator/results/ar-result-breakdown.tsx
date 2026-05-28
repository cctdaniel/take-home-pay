import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function ARResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "AR" || breakdown.type !== "AR") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Total deductions from gross</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(breakdown.totalDeductionsFromGross, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable (ganancias)</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(breakdown.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Ganancias (4th category)"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social (on gross)</p>
      <DeductionRow
        label={`Jubilación (${(breakdown.social.jubilacionRate * 100).toFixed(0)}%)`}
        amount={taxes.jubilacion}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Obra social"
        amount={taxes.obraSocial}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="PAMI"
        amount={taxes.pami}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-2 text-xs italic text-zinc-500">{breakdown.taxPeriod}</p>
    </>
  );
}
