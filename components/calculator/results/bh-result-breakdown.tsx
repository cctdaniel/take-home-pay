import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function BHResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "BH" || breakdown.type !== "BH") {
    return null;
  }

  const isNational = breakdown.nationality === "bahraini_national";

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Status</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {isNational ? "Bahraini national" : "Expatriate"}
        </span>
      </div>
      <Separator className="my-2" />
      <DeductionRow
        label="Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.socialInsuranceEmployee > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="mb-2 text-xs text-zinc-400">
            {formatPercentage(breakdown.socialInsurance.employeeRate)} on capped
            base {formatCurrency(breakdown.contributionBase, currency)}/year.
          </p>
          <DeductionRow
            label={isNational ? "SIO Employee" : "Unemployment Insurance"}
            amount={taxes.socialInsuranceEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : (
        <p className="mt-2 text-xs italic text-zinc-500">
          No employee social deduction modeled.
        </p>
      )}
    </>
  );
}
