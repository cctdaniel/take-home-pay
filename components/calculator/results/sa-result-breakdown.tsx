import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function SAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "SA" || breakdown.type !== "SA") {
    return null;
  }

  const isNational = breakdown.nationality === "saudi_national";

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Status</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {isNational ? "Saudi national" : "Expatriate"}
        </span>
      </div>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {isNational ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">GOSI</p>
          <p className="mb-2 text-xs text-zinc-400">
            {formatPercentage(breakdown.gosi.employeeRate)} on{" "}
            {formatCurrency(breakdown.contributionSalaryMonthly, currency)}/month
            contribution salary ({(breakdown.gosi.salaryShare * 100).toFixed(0)}%
            gross proxy).
          </p>
          <DeductionRow
            label="Employee GOSI"
            amount={taxes.gosiEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : (
        <p className="mt-2 text-xs italic text-zinc-500">
          No employee GOSI deduction modeled for expatriates.
        </p>
      )}
    </>
  );
}
