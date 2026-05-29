import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function SIResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "SI" || breakdown.type !== "SI") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <DeductionRow
        label={`Employee Social (${formatPercentage(breakdown.socialInsurance.rate)})`}
        amount={taxes.socialInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Progressive PIT"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
