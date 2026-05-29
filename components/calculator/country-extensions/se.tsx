"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { SE_SOURCE_URLS } from "@/lib/countries/se/constants/tax-year-2026";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { clampAmount } from "@/lib/utils";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { SECalculatorInputs } from "@/lib/countries/se/types";

export default function SECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setInputs,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<SECalculatorInputs>(country);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);
  const ipsContributionLimit = limits.ipsContribution?.limit ?? 0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="se-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="IPS pension savings"
          description="Private pension deduction up to 35% of income (when no occupational pension)."
          value={inputs.contributions.ipsContribution}
          onChange={(ipsContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                ipsContribution: clampAmount(ipsContribution, ipsContributionLimit),
              },
            }))
          }
          max={ipsContributionLimit}
          step={1000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Sweden employment salary for a full tax year
            using the calculator&apos;s current national assumptions.
          </p>
          <p className="mt-2">
            Municipality-specific refinements, special expatriate regimes,
            non-salary income, capital income, employer-only costs, and family
            benefit programs are outside this first-pass salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}
