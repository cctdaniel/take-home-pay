import { Separator } from "@/components/ui/separator";
import { isEGBreakdown, isEGTaxBreakdown } from "@/lib/countries/eg/types";
import { formatCurrency } from "@/lib/format";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function EGResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const { taxes, breakdown } = result;

  if (!isEGTaxBreakdown(taxes) || !isEGBreakdown(breakdown)) {
    return null;
  }

  return (
    <>
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Egypt Social Insurance Salary
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Coverage status</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.socialInsuranceCovered
            ? "Covered by NOSI"
            : "Exempt / not covered"}
        </span>
      </div>
      {breakdown.socialInsuranceCovered ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Monthly social insurance salary
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(
                breakdown.socialInsuranceSalaryMonthly,
                currency,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Annual social insurance salary
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.socialInsuranceSalaryAnnual, currency)}
            </span>
          </div>
        </>
      ) : null}

      <Separator className="my-2" />
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="EG"
        countryName="Egypt"
        taxableNonCashBenefitsLabel="Taxable Employment Benefits"
        taxableGrossIncomeLabel="Egypt Salary-Tax Gross Base"
      />
    </>
  );
}
