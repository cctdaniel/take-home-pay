import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function ZAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "ZA" || breakdown.type !== "ZA") {
    return null;
  }

  return (
    <>
      {breakdown.retirementAnnuity > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Retirement annuity</span>
          <span className="text-sm tabular-nums text-zinc-200">
            {formatCurrency(breakdown.retirementAnnuity, currency)}
          </span>
        </div>
      )}
      {breakdown.medicalTaxCredit > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Medical tax credit</span>
          <span className="text-sm tabular-nums text-emerald-400">
            -{formatCurrency(breakdown.medicalTaxCredit, currency)}
          </span>
        </div>
      )}
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">PAYE</p>
      <DeductionRow
        label="Income tax (after rebate & credits)"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`UIF (${(breakdown.uif.rate * 100).toFixed(0)}%, capped)`}
        amount={taxes.uif}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
