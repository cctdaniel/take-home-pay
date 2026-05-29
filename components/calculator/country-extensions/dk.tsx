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
import { DK_SOURCE_URLS } from "@/lib/countries/dk/constants/tax-year-2026";
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { DKCalculatorInputs } from "@/lib/countries/dk/types";

export default function DKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
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
        <NoVoluntaryPitReliefNote
          explanation="Denmark does not use standard monthly payroll withholding for employee-chosen voluntary pension top-ups. Workplace pensions and private retirement products are arranged outside this salary withholding model."
          mandatoryLabel="Labour-market contributions and A-tax withholding on taxable income after the employment deduction."
          sourceUrl={DK_SOURCE_URLS.skmTaxCalculationRules}
          sourceLabel="SKAT — tax calculation rules"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No employee voluntary income-tax relief on monthly payroll salary"
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
