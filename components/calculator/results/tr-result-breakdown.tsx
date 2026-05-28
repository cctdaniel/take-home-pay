import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function TRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "TR" || breakdown.type !== "TR") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Min wage exemption</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(breakdown.minimumWageExemption, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable after exemption</span>
        <span className="text-sm tabular-nums text-zinc-200">
          {formatCurrency(breakdown.taxableAfterExemption, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="GVK income tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social</p>
      <DeductionRow
        label={`SGK (${(breakdown.social.sgkRate * 100).toFixed(0)}%)`}
        amount={taxes.sgk}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Unemployment"
        amount={taxes.unemployment}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
