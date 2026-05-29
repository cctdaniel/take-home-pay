"use client";

import { PayFrequencyField } from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { clampAmount } from "@/lib/utils";
import { InfoPanel } from "@/components/calculator/info-panel";
import { JP_IDECO_ANNUAL_CAP_WITH_EMPLOYER_PENSION_2026 } from "@/lib/countries/jp/constants/tax-parameters-2026";
import type { JPCalculatorInputs } from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

export default function JPCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<JPCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <div className="space-y-4">
          <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />

          <InfoPanel title="Japan assumptions" tone="neutral">
            Modeled with 2026 national income tax brackets (5–45%), 2.1%
            reconstruction surtax on national tax, and 10% flat resident tax.
            Employment income deduction is automatically applied based on gross
            salary. Social insurance (pension ~9.15%, health ~5%, employment
            0.6%) uses national average rates. Spousal deduction, dependent
            deductions, local tax variations, and employer benefits are excluded.
          </InfoPanel>
        </div>
      }
      contributions={
        <ContributionSlider
          label="iDeCo contribution"
          description="Deductible small mutual aid / iDeCo (employee with employer pension)."
          value={inputs.contributions.idecoContribution}
          onChange={(idecoContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                idecoContribution: clampAmount(idecoContribution, JP_IDECO_ANNUAL_CAP_WITH_EMPLOYER_PENSION_2026),
              },
            }))
          }
          max={JP_IDECO_ANNUAL_CAP_WITH_EMPLOYER_PENSION_2026}
          step={10000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
    />
  );
}
