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
import { IS_SOURCE_URLS } from "@/lib/countries/is/constants/tax-year-2026";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { clampAmount } from "@/lib/utils";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { ISCalculatorInputs } from "@/lib/countries/is/types";

export default function ISCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setInputs,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<ISCalculatorInputs>(country);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);
  const privatePensionSavingsLimit = limits.privatePensionSavings?.limit ?? 0;

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
            id="is-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Private pension savings"
          description="Supplementary pension up to 4% of gross wages."
          value={inputs.contributions.privatePensionSavings}
          onChange={(privatePensionSavings) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                privatePensionSavings: clampAmount(privatePensionSavings, privatePensionSavingsLimit),
              },
            }))
          }
          max={privatePensionSavingsLimit}
          step={50000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Iceland employment salary for a full tax year
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
