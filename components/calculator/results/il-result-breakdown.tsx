import { Separator } from "@/components/ui/separator";
import { isILBreakdown } from "@/lib/countries/il/types";
import { formatCurrency } from "@/lib/format";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function ILResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const breakdown = isILBreakdown(result.breakdown) ? result.breakdown : null;

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="IL"
        countryName="Israel"
        reliefSectionTitle="Israel Credit Points And Pension Inputs"
        taxSectionTitle="Israel Income Tax And National Insurance"
      />
      {breakdown && breakdown.studyFundEmployeeContribution > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Israel Study Fund
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Study fund salary base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.studyFundSalaryBase, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Employer study fund contribution
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              +{formatCurrency(breakdown.studyFundEmployerContribution, currency)}
            </span>
          </div>
          <p className="mt-1 text-xs italic text-zinc-500">
            Employer study fund value is shown as account inflow, not current
            take-home cash.
          </p>
        </>
      ) : null}
    </>
  );
}
