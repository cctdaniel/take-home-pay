"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { InfoPanel } from "@/components/calculator/info-panel";
import { PayFrequencyField } from "@/components/calculator/calculator-fields";
import {
  type CountryCalculatorExtensionProps,
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { CANADA_RRSP_2026 } from "@/lib/countries/ca/constants/tax-year-2026";
import type { CACalculatorInputs } from "@/lib/countries/ca/types";
import { formatCurrency } from "@/lib/format";

function getRrspLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * CANADA_RRSP_2026.contributionRateLimit,
    CANADA_RRSP_2026.annualDollarLimit,
  );
}

export default function CACountryExtension({ country }: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<CACalculatorInputs>(country);
  const rrspLimit = getRrspLimit(inputs.grossSalary);

  const updateInputs = (updater: (current: CACalculatorInputs) => CACalculatorInputs) => {
    setInputs((current) => {
      const next = updater(current);
      const nextLimit = getRrspLimit(next.grossSalary);
      return {
        ...next,
        contributions: {
          rrspContribution: Math.min(
            Math.max(0, next.contributions.rrspContribution),
            nextLimit,
          ),
        },
      };
    });
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        updateInputs((current) => ({ ...current, grossSalary }))
      }
      result={result}
      taxOptions={
        <PayFrequencyField
          id="ca-pay-frequency"
          value={inputs.payFrequency}
          onChange={(payFrequency) =>
            updateInputs((current) => ({ ...current, payFrequency }))
          }
        />
      }
      contributions={
        <ContributionSlider
          label="RRSP Contribution"
          description="Modeled as a taxable-income deduction, capped at 18% of gross income and the annual dollar limit."
          value={inputs.contributions.rrspContribution}
          onChange={(rrspContribution) =>
            updateInputs((current) => ({
              ...current,
              contributions: { rrspContribution },
            }))
          }
          max={rrspLimit}
          step={100}
          currency={currency}
        />
      }
      contributionsTitle="Retirement Contributions"
      contributionsDescription="Modeled Canada RRSP deduction"
      infoCard={
        <InfoPanel title="Modeled Scope">
          Uses 2026 federal and Ontario brackets, base CPP, CPP2, and EI. RRSP
          is capped at {formatCurrency(CANADA_RRSP_2026.annualDollarLimit, currency)}
          or 18% of gross income. Unused RRSP room, pension adjustments, credits,
          surtaxes, and provincial health premiums are not modeled.
        </InfoPanel>
      }
      seoInfo={
        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Canada salary after tax calculator</h2>
          <p>
            Estimate Canadian take-home pay using federal and Ontario income tax,
            CPP/CPP2, EI, and optional RRSP contributions. This is a first-pass
            Ontario model and does not replace payroll or tax advice.
          </p>
        </section>
      }
    />
  );
}
