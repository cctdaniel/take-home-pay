"use client";

import {
  CalculatorFieldGrid,
  NumberField,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import type { VNCalculatorInputs } from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

export default function VNCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<VNCalculatorInputs>(country);

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
            <NumberField
              id="vn-dependents"
              label="Tax Dependents"
              value={inputs.numberOfDependents}
              onChange={(numberOfDependents) =>
                setInputs((current) => ({ ...current, numberOfDependents }))
              }
              min={0}
              max={10}
              description="Deduction of 52.8M VND/year per dependent"
            />
            <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />
          </CalculatorFieldGrid>

          <InfoPanel title="Vietnam assumptions" tone="neutral">
            Modeled with 2026 progressive income tax brackets (5–35%).
            Personal deduction of 132,000,000 VND/year (11M/month) and
            dependent deduction of 52,800,000 VND/year/dependent (4.4M/month).
            Social insurance (8%), health insurance (1.5%), and unemployment
            insurance (1%) contributions apply up to 20× base salary ceiling.
            Employer contributions, business income, and irregular income
            are excluded.
          </InfoPanel>
        </div>
      }
    />
  );
}
