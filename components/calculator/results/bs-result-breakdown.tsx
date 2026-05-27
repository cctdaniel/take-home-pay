import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { isBSBreakdown } from "@/lib/countries/bs/types";
import type { CountryResultBreakdownProps } from "./types";

const NIB_CATEGORY_LABELS = {
  standard: "Standard employed person",
  age65PlusNotRetired: "Age 65+ not receiving Retirement Benefit",
  age60to64RetirementBenefit: "Age 60-64 receiving Retirement Benefit",
  age65PlusRetirementBenefit: "Age 65+ receiving Retirement Benefit",
  summerEmployment: "Summer employment",
} as const;

export function BSResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const { breakdown } = result;

  if (!isBSBreakdown(breakdown) || !("nibInsurableWeeklyWage" in breakdown)) {
    return (
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="BS"
        countryName="Bahamas"
      />
    );
  }

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        expectedCountry="BS"
        countryName="Bahamas"
        taxSectionTitle="Bahamas NIB And Payroll Deductions"
      />
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Bahamas NIB Wage Base
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">NIB category</span>
        <span className="text-right text-sm text-zinc-300">
          {NIB_CATEGORY_LABELS[breakdown.nibCategory]}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Weekly basic wage</span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.nibInsurableWeeklyWage, currency)}
        </span>
      </div>
      {breakdown.weeklyFormalGratuities > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Weekly formal tips / gratuities
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.weeklyFormalGratuities, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Annual formal tips / gratuities
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.annualFormalGratuities, currency)}
            </span>
          </div>
        </>
      ) : null}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Basic wage employee rate</span>
        <span className="text-sm tabular-nums text-zinc-300">
          {(breakdown.nibBasicWageEmployeeRate * 100).toFixed(2)}%
        </span>
      </div>
      {breakdown.nibEmployerOnlyContributionAnnual > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Employer-only NIB context
          </span>
          <span className="text-sm tabular-nums text-zinc-300">
            {formatCurrency(
              breakdown.nibEmployerOnlyContributionAnnual,
              currency,
            )}
          </span>
        </div>
      ) : null}
      <p className="text-xs italic text-zinc-500">
        NIB employee contributions are calculated on the selected weekly basic
        wage and formal gratuities, capped by the official weekly ceiling.
        Employer-only context shown here does not reduce take-home pay.
      </p>
    </>
  );
}
