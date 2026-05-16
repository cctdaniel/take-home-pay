"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  UAE_EMPLOYEE_CATEGORY_OPTIONS,
  UAE_EMPLOYEE_CATEGORY_SETTINGS,
} from "@/lib/countries/ae/constants/tax-year-2026";
import type {
  AECalculatorInputs,
  AEEmployeeCategory,
} from "@/lib/countries/ae/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

export default function AECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<AECalculatorInputs>(country);
  const selectedCategory =
    UAE_EMPLOYEE_CATEGORY_SETTINGS[inputs.employeeCategory];

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
              id="ae-employee-category"
              label="Employee Category"
              value={inputs.employeeCategory}
              onChange={(employeeCategory: AEEmployeeCategory) =>
                setInputs((current) => ({ ...current, employeeCategory }))
              }
              options={UAE_EMPLOYEE_CATEGORY_OPTIONS}
              description={selectedCategory.salaryBaseDescription}
            />
            <PayFrequencyField
              value={inputs.payFrequency}
              onChange={setPayFrequency}
            />
          </CalculatorFieldGrid>

          <InfoPanel title="UAE assumptions" tone="neutral">
            Salary income is modeled with 0% UAE personal income tax. GPSSA
            pension is modeled for UAE nationals using private-sector settings,
            and GCC categories use GPSSA insurance extension rates applied to
            the full salary. Visa costs, free-zone or corporate tax positions,
            self-employment, end-of-service gratuity, unemployment insurance,
            medical insurance, and employer-specific benefits are excluded.
          </InfoPanel>
        </div>
      }
    />
  );
}
