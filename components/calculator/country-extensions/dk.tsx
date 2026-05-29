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
import { DK_RATEPENSION_ANNUAL_CAP_2026, DK_SOURCE_URLS } from "@/lib/countries/dk/constants/tax-year-2026";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { clampAmount } from "@/lib/utils";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { DKCalculatorInputs } from "@/lib/countries/dk/types";

export default function DKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setInputs,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<DKCalculatorInputs>(country);

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
            id="dk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Ratepension / term annuity"
          description="Deductible private pension savings up to DKK 68,700 per year combined."
          value={inputs.contributions.ratepension}
          onChange={(ratepension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                ratepension: clampAmount(ratepension, DK_RATEPENSION_ANNUAL_CAP_2026),
              },
            }))
          }
          max={DK_RATEPENSION_ANNUAL_CAP_2026}
          step={1000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Denmark employment salary for a full tax year
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
