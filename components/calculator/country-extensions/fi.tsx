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
import { FI_SOURCE_URLS } from "@/lib/countries/fi/constants/tax-year-2026";
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { FICalculatorInputs } from "@/lib/countries/fi/types";

export default function FICountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<FICalculatorInputs>(country);

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
            id="fi-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Finnish TyEL pension is mandatory on wages. Employee-chosen voluntary private pension savings are not deducted through employment withholding in this calculator."
          mandatoryLabel="Employee TyEL and income tax after the standard deduction and municipal withholding assumptions."
          sourceUrl={FI_SOURCE_URLS.telaPensionContributions}
          sourceLabel="Finnish Centre for Pensions (TELA)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No employee voluntary income-tax relief on monthly payroll salary"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Finland employment salary for a full tax year
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
