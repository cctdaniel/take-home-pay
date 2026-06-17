import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function MEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "ME" || breakdown.type !== "ME") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Monthly Taxable (after social)</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.monthlyTaxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Deductions</p>
      <DeductionRow
        label="Pension (PIO 10%)"
        amount={taxes.pensionEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Unemployment (0.5%)"
        amount={taxes.unemploymentEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax (monthly tariff)</p>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Monthly withholding</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.monthlyIncomeTax, currency)}
        </span>
      </div>
      <DeductionRow
        label="Annual Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
    </>
  );
}
