import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function ILResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "IL" || breakdown.type !== "IL") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Credit points</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {breakdown.creditPoints.toFixed(2)}
        </span>
      </div>
      {breakdown.taxCredit > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Tax credit</span>
          <span className="text-sm tabular-nums text-emerald-400">
            -{formatCurrency(breakdown.taxCredit, currency)}
          </span>
        </div>
      )}
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Net income tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social</p>
      <DeductionRow
        label="Bituach Leumi"
        amount={taxes.bituachLeumi}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Health insurance"
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Mandatory pension"
        amount={taxes.pension}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
