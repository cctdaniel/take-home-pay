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
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { ISCalculatorInputs } from "@/lib/countries/is/types";

export default function ISCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<ISCalculatorInputs>(country);

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
        <NoVoluntaryPitReliefNote
          explanation="Iceland’s 4% mandatory employee pension is withheld on salary. Supplementary private pension savings are not deducted through payroll withholding in this calculator."
          mandatoryLabel="Mandatory 4% employee pension and progressive income tax after the personal tax credit."
          sourceUrl={IS_SOURCE_URLS.skatturinnBrackets}
          sourceLabel="Skatturinn"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No employee voluntary income-tax relief on monthly payroll salary"
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
