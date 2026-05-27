import { Separator } from "@/components/ui/separator";
import { PH_SOURCE_URLS } from "@/lib/countries/ph/constants/tax-parameters-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function PHResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "PH" || breakdown.type !== "PH") {
    return null;
  }

  const hasSSS = taxes.sssEmployee > 0;
  const hasPhilHealth = taxes.philHealthEmployee > 0;
  const hasPagIbig = taxes.pagIbigEmployee > 0;
  const has13thMonthExemption =
    breakdown.thirteenthMonthAndOtherBenefitsExempt > 0;
  const deMinimis = breakdown.deMinimisBenefitsExempt;
  const deMinimisRows = [
    {
      label: "Medical cash allowance",
      amount: deMinimis.medicalCashAllowance,
    },
    { label: "Rice subsidy", amount: deMinimis.riceSubsidy },
    {
      label: "Uniform / clothing allowance",
      amount: deMinimis.uniformClothing,
    },
    {
      label: "Actual medical assistance",
      amount: deMinimis.actualMedicalAssistance,
    },
    { label: "Laundry allowance", amount: deMinimis.laundryAllowance },
    { label: "Achievement awards", amount: deMinimis.achievementAwards },
    {
      label: "Christmas / anniversary gifts",
      amount: deMinimis.christmasGifts,
    },
    {
      label: "CBA productivity incentives",
      amount: deMinimis.cbaProductivityIncentives,
    },
  ].filter((row) => row.amount > 0);

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxpayer Type</span>
        <span className="text-sm text-zinc-200 text-right">
          {breakdown.taxpayerType === "nraNotEngaged"
            ? "NRA not engaged in trade"
            : "Graduated compensation income"}
        </span>
      </div>
      {has13thMonthExemption && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            13th month / other benefits excluded
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.thirteenthMonthAndOtherBenefitsExempt,
              currency,
            )}
          </span>
        </div>
      )}
      {deMinimisRows.length > 0 && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            De Minimis Benefits Excluded
          </p>
          {deMinimisRows.map(({ label, amount }) => (
            <div className="flex items-center justify-between py-1" key={label}>
              <span className="text-sm text-zinc-400">{label}</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(amount, currency)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-zinc-500">Total de minimis</span>
            <span className="text-xs text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.deMinimisBenefitsExempt.total, currency)}
            </span>
          </div>
        </>
      )}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Compensation</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label={
          breakdown.taxpayerType === "nraNotEngaged"
            ? "25% Gross Income Tax"
            : "Income Tax (TRAIN)"
        }
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      {(hasSSS || hasPhilHealth || hasPagIbig) && (
        <Separator className="my-2" />
      )}

      {hasSSS && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">Social Security System</p>
          <DeductionRow
            label="SSS employee"
            amount={taxes.sssEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            MSC: {formatCurrency(breakdown.sss.msc, currency)}/month
            (range: {formatCurrency(breakdown.sss.minMsc, currency)}–{formatCurrency(breakdown.sss.maxMsc, currency)}).
            Rate: {formatPercentage(breakdown.sss.rate)}.
          </p>
        </>
      )}

      {hasPhilHealth && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">PhilHealth</p>
          <DeductionRow
            label="PhilHealth employee"
            amount={taxes.philHealthEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Base: {formatCurrency(breakdown.philHealth.monthlyBase, currency)}/month
            (floor {formatCurrency(breakdown.philHealth.floor)}, ceiling{" "}
            {formatCurrency(breakdown.philHealth.ceiling)}).
            Rate: {formatPercentage(breakdown.philHealth.rate)}.
          </p>
        </>
      )}

      {hasPagIbig && (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">Pag-IBIG Fund</p>
          <DeductionRow
            label="Pag-IBIG employee"
            amount={taxes.pagIbigEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            MFS: {formatCurrency(breakdown.pagIbig.mfs, currency)}/month
            (ceiling {formatCurrency(breakdown.pagIbig.ceiling, currency)}).
            Rate: {formatPercentage(breakdown.pagIbig.rate)}.
          </p>
        </>
      )}

      <ResultNotes
        countryName="Philippines"
        exclusions={[
          "Monetized leave-credit details, overtime/night differential exclusions, employer SSS/PhilHealth/Pag-IBIG contributions, substituted filing, self-employment, and mixed-income earner rules require payroll or filing facts beyond this salary model.",
        ]}
        sourceUrls={Object.values(PH_SOURCE_URLS)}
      />
    </>
  );
}
