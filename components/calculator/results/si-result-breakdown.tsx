import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { isSIBreakdown } from "@/lib/countries/si/types";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function SIResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const breakdown = isSIBreakdown(result.breakdown)
    ? result.breakdown
    : null;
  const reimbursements = breakdown?.taxExemptReimbursements;

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="SI"
        countryName="Slovenia"
      />
      {breakdown && reimbursements && reimbursements.total > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Tax-Exempt Cash on Top
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Taxable salary base</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableSalary, currency)}
            </span>
          </div>
          {reimbursements.meal > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Meal reimbursement
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                +{formatCurrency(reimbursements.meal, currency)}
              </span>
            </div>
          ) : null}
          {reimbursements.transport > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Commute reimbursement
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                +{formatCurrency(reimbursements.transport, currency)}
              </span>
            </div>
          ) : null}
          {reimbursements.holidayAllowance > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Holiday allowance</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                +{formatCurrency(reimbursements.holidayAllowance, currency)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-zinc-300">
              Total tax-exempt reimbursements
            </span>
            <span className="text-sm font-medium text-emerald-400 tabular-nums">
              +{formatCurrency(reimbursements.total, currency)}
            </span>
          </div>
        </>
      ) : null}
    </>
  );
}
