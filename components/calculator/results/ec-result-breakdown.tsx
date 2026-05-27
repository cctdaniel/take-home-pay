import { Separator } from "@/components/ui/separator";
import { isECBreakdown } from "@/lib/countries/ec/types";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function ECResultBreakdown(props: CountryResultBreakdownProps) {
  const { result } = props;
  const breakdown = isECBreakdown(result.breakdown)
    ? result.breakdown
    : null;

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="EC"
        countryName="Ecuador"
      />
      {breakdown ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Ecuador Salary Inputs
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Personal-expense basket cap
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {breakdown.personalExpenseBasketCount.toLocaleString()} baskets
            </span>
          </div>
        </>
      ) : null}
    </>
  );
}
