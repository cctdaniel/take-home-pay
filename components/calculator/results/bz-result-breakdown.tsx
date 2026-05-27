import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { isBZBreakdown } from "@/lib/countries/bz/types";
import type { CountryResultBreakdownProps } from "./types";

const SSB_STATUS_LABELS = {
  standard: "Standard insurable employee",
  age60to64ReceivingBenefit: "Age 60-64 receiving SSB retirement benefit",
  age65Plus: "Age 65 or older",
} as const;

export function BZResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const { breakdown } = result;

  if (!isBZBreakdown(breakdown) || !("socialSecurityStatus" in breakdown)) {
    return (
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="BZ"
        countryName="Belize"
      />
    );
  }

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="BZ"
        countryName="Belize"
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Belize SSB And Return Relief Context
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">SSB status</span>
        <span className="text-right text-sm text-zinc-300">
          {SSB_STATUS_LABELS[breakdown.socialSecurityStatus]}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Weekly SSB insurable earnings
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.ssbWeeklyInsurableEarnings, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Weekly employee SSB deduction
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.ssbEmployeeWeeklyContribution, currency)}
        </span>
      </div>
      {breakdown.ssbEmployerOnlyAnnualContribution > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Employer-only SSB context
          </span>
          <span className="text-sm tabular-nums text-zinc-300">
            {formatCurrency(
              breakdown.ssbEmployerOnlyAnnualContribution,
              currency,
            )}
          </span>
        </div>
      ) : null}
      {breakdown.educationReliefChildren > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Eligible education relief children
          </span>
          <span className="text-sm tabular-nums text-zinc-300">
            {breakdown.educationReliefChildren}
          </span>
        </div>
      ) : null}
      <p className="text-xs italic text-zinc-500">
        SSB employer-only context is shown for retired-person categories and
        does not reduce employee take-home pay. Charity and education reliefs
        reduce modeled annual income tax only.
      </p>
    </>
  );
}
