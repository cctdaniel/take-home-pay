"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { INCalculatorInputs, INRegime } from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

const REGIME_OPTIONS = [
  { value: "new" as const, label: "New Regime (default)" },
  { value: "old" as const, label: "Old Regime" },
];

export default function INCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<INCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <div className="space-y-4">
          <CalculatorFieldGrid columns={2}>
            <SelectField
              id="in-regime"
              label="Tax Regime"
              value={inputs.regime}
              onChange={(regime: INRegime) =>
                setInputs((current) => ({ ...current, regime }))
              }
              options={REGIME_OPTIONS}
              description="New regime (0–30%, fewer deductions) vs old regime (0–30%, more deductions)"
            />
            <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />
          </CalculatorFieldGrid>

          <BooleanSelectField
            id="in-epf"
            label="EPF Applicable"
            value={inputs.isEpfApplicable}
            onChange={(isEpfApplicable) =>
              setInputs((current) => ({ ...current, isEpfApplicable }))
            }
            description="Employee Provident Fund (12% employee contribution capped at 15,000 INR/month wage)"
          />

          <InfoPanel title="India assumptions" tone="neutral">
            Modeled with 2026 income tax brackets for the selected regime
            (0–30%). New regime includes 75,000 INR standard deduction and
            Section 87A rebate (up to 60,000 INR). Old regime includes 50,000
            INR standard deduction. Surcharge (10–37%) applies to income
            above 5,000,000 INR. Health & Education Cess of 4% on income tax
            plus surcharge. EPF employee contribution modeled at 12% on
            monthly wage up to 15,000 INR ceiling. NPS, professional tax,
            and state-level variations are excluded.
          </InfoPanel>
        </div>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Section 80C, 80CCD, and similar Chapter VI-A deductions are claimed when filing income tax returns, not through monthly TDS salary slips in this calculator."
          mandatoryLabel="Employee PF, professional tax where applicable, and TDS on taxable salary."
          sourceUrl="https://www.incometax.gov.in/"
          sourceLabel="Income Tax Department (India)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Chapter VI-A deductions are outside monthly TDS payroll"
    />
  );
}
