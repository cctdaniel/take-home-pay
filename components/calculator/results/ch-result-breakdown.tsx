import { Separator } from "@/components/ui/separator";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function CHResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "CH" || breakdown.type !== "CH") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Canton</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.cantonName}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Filing</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.filingStatus === "married"
            ? "Married (splitting)"
            : "Single"}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Federal income tax"
        amount={taxes.federalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Canton portion (×${breakdown.cantonTaxMultiplier.toFixed(2)} total)`}
        amount={taxes.cantonIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Insurance</p>
      <DeductionRow
        label={`AHV/IV/EO (${(breakdown.social.ahvIvEoRate * 100).toFixed(1)}%)`}
        amount={taxes.ahvIvEo}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="ALV"
        amount={taxes.alv}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
