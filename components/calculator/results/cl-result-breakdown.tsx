import { Separator } from "@/components/ui/separator";
import { isCLBreakdown } from "@/lib/countries/cl/types";
import { formatCurrency } from "@/lib/format";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function CLResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const breakdown = isCLBreakdown(result.breakdown) ? result.breakdown : null;

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="CL"
        countryName="Chile"
        reliefSectionTitle="Chile Allowances, APV, And Relief Inputs"
        taxSectionTitle="Chile Second Category Tax And Social Contributions"
      />
      {breakdown && breakdown.apvContribution > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Chile APV Treatment
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">APV regime</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {breakdown.apvTaxRegime === "regimeA"
                ? "Regime A fiscal bonus"
                : "Regime B tax deduction"}
            </span>
          </div>
          {breakdown.apvTaxRegime === "regimeA" ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Fiscal bonus to APV account
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                +{formatCurrency(breakdown.apvFiscalBonus, currency)}
              </span>
            </div>
          ) : null}
          {breakdown.apvTaxRegime === "regimeA" ? (
            <p className="mt-1 text-xs italic text-zinc-500">
              Regime A bonus is shown for retirement-account value only; it does
              not increase current take-home cash.
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
