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
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { NO_IPS_DEDUCTION_LIMIT } from "@/lib/countries/no/constants/tax-year-2026";
import type { NOCalculatorInputs } from "@/lib/countries/no/types";

export default function NOCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<NOCalculatorInputs>(country);

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
            id="no-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="IPS pension savings"
          value={inputs.contributions.ipsContribution}
          onChange={(ipsContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                ipsContribution: Math.min(
                  NO_IPS_DEDUCTION_LIMIT,
                  Math.max(0, ipsContribution),
                ),
              },
            }))
          }
          max={NO_IPS_DEDUCTION_LIMIT}
          currency={currency}
          description="Optional individual pension savings deduction, modeled up to the 2026 annual cap."
        />
      }
      contributionsTitle="Voluntary Pension Savings"
      contributionsDescription="Optional tax-saving IPS contribution"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Norway employment salary for a full tax year
            using the calculator&apos;s current national assumptions.
          </p>
          <p className="mt-2">
            PAYE for temporary non-residents, wealth tax, regional employer
            contributions, travel/interest deductions, holiday-pay timing, and
            non-salary income are outside this salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}
