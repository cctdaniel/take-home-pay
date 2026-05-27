import { Separator } from "@/components/ui/separator";
import { isPEBreakdown } from "@/lib/countries/pe/types";
import { formatCurrency } from "@/lib/format";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function PEResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const breakdown = isPEBreakdown(result.breakdown) ? result.breakdown : null;

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        grossSalary={result.grossSalary}
        expectedCountry="PE"
        countryName="Peru"
        taxSectionTitle="Peru Fifth-Category Tax And Pension Deductions"
      />
      {breakdown ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Peru Salary Structure
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Regular pensionable pay
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.regularRemuneration, currency)}
            </span>
          </div>
          {breakdown.statutoryGratifications > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                July / December gratifications
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(breakdown.statutoryGratifications, currency)}
              </span>
            </div>
          ) : null}
          {breakdown.extraordinaryGratificationBonus > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Extraordinary gratification bonus
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(
                  breakdown.extraordinaryGratificationBonus,
                  currency,
                )}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Pension system</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {breakdown.pensionSystemName}
            </span>
          </div>
          {breakdown.pensionSystem !== "onp" ? (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  AFP insurance base
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(breakdown.afpInsuranceBase, currency)}
                </span>
              </div>
              {breakdown.afpCommissionMode === "balance" ? (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Balance commission
                  </span>
                  <span className="text-sm text-zinc-200 tabular-nums">
                    {(breakdown.afpBalanceCommissionRate * 100).toFixed(2)}%
                  </span>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}
