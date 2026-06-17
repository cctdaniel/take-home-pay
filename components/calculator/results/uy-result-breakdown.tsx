import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function UYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "UY" || breakdown.type !== "UY") {
    return null;
  }

  return (
    <>
      <DeductionRow
        label={`Social Security (${formatPercentage(breakdown.socialSecurity.rate)})`}
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">MNIG Exemption (7 BPC)</span>
        <span className="text-sm text-zinc-400 tabular-nums">
          up to {formatCurrency(breakdown.mnigAnnual, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <DeductionRow
        label="Progressive IRPF"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
