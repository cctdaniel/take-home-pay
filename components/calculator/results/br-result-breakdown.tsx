import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function BRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "BR" || breakdown.type !== "BR") {
    return null;
  }

  return (
    <>
      {breakdown.numberOfDependents > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Dependent Deduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.dependentDeductionAnnual, currency)}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income (annual)</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      <Separator className="my-2" />
      <DeductionRow
        label="INSS (employee)"
        amount={taxes.inssEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="-mt-1 mb-1 text-xs italic text-zinc-500">
        Monthly INSS {formatCurrency(breakdown.inss.monthly, currency)} (ceiling{" "}
        {formatCurrency(breakdown.inss.monthlyCeiling, currency)}/month).
      </p>
      <DeductionRow
        label="IRPF"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="text-xs italic text-zinc-500">
        Monthly IRPF base{" "}
        {formatCurrency(breakdown.irpf.monthlyTaxable, currency)} → tax{" "}
        {formatCurrency(breakdown.irpf.monthlyTax, currency)}/month.
      </p>
      {breakdown.voluntaryContributions.privatePension > 0 && (
        <>
          <Separator className="my-2" />
          <DeductionRow
            label="Private pension (PGBL/VGBL)"
            amount={breakdown.voluntaryContributions.privatePension}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      )}
    </>
  );
}
