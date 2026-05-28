import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function QAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "QA" || breakdown.type !== "QA") {
    return null;
  }

  const isNational = breakdown.nationality === "qatari_national";

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Status</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {isNational ? "Qatari national" : "Expatriate"}
        </span>
      </div>
      <Separator className="my-2" />
      <DeductionRow
        label="Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {isNational ? (
        <>
          <Separator className="my-2" />
          <p className="mb-2 text-xs text-zinc-400">
            {formatPercentage(breakdown.socialInsurance.employeeRate)} on{" "}
            {formatCurrency(breakdown.contributionSalaryMonthly, currency)}/month
            contribution salary.
          </p>
          <DeductionRow
            label="Employee Social Insurance"
            amount={taxes.socialInsuranceEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : (
        <p className="mt-2 text-xs italic text-zinc-500">
          No employee social insurance modeled for expatriates.
        </p>
      )}
    </>
  );
}
