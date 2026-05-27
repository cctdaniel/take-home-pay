import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { isJOBreakdown } from "@/lib/countries/jo/types";
import type { CountryResultBreakdownProps } from "./types";

export function JOResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const { breakdown } = result;

  if (!isJOBreakdown(breakdown) || !("sscMonthlyWage" in breakdown)) {
    return (
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="JO"
        countryName="Jordan"
      />
    );
  }

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="JO"
        countryName="Jordan"
        taxSectionTitle="Jordan Income Tax And SSC Deductions"
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Jordan SSC Wage Base
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Monthly contribution wage
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.sscMonthlyWage, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Social Security employee deductions are calculated on the selected SSC
        wage, capped by the official 2026 maximum wage.
      </p>
    </>
  );
}
