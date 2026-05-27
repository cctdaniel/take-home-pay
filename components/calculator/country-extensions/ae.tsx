"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  getUaeIloeCategoryFromBasicSalary,
  UAE_ILOE_CATEGORY_1_BASIC_SALARY_MAX,
  UAE_EMPLOYEE_CATEGORY_OPTIONS,
  UAE_EMPLOYEE_CATEGORY_SETTINGS,
  UAE_UNEMPLOYMENT_INSURANCE_CATEGORIES,
  UAE_UNEMPLOYMENT_INSURANCE_OPTIONS,
} from "@/lib/countries/ae/constants/tax-year-2026";
import type {
  AECalculatorInputs,
  AEEmployeeCategory,
} from "@/lib/countries/ae/types";
import type { UAEUnemploymentInsuranceCategory } from "@/lib/countries/ae/constants/tax-year-2026";
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
  const selectedUnemploymentInsurance =
    UAE_UNEMPLOYMENT_INSURANCE_CATEGORIES[
      inputs.unemploymentInsuranceCategory
    ];
  const monthlyGrossSalary = Math.max(0, inputs.grossSalary) / 12;
  const hasPension = selectedCategory.employeeRate > 0;
  const pensionContributionSalaryMax =
    selectedCategory.monthlyMaximum === undefined
      ? monthlyGrossSalary
      : Math.min(
          Math.max(monthlyGrossSalary, selectedCategory.monthlyMinimum ?? 0),
          selectedCategory.monthlyMaximum,
        );
  const pensionContributionSalaryMonthly = hasPension
    ? Math.min(
        Math.max(
          inputs.pensionContributionSalaryMonthly ||
            pensionContributionSalaryMax,
          selectedCategory.monthlyMinimum ?? 0,
        ),
        pensionContributionSalaryMax,
      )
    : 0;
  const iloeBasicSalaryMonthly =
    inputs.unemploymentInsuranceCategory === "notCovered"
      ? 0
      : Math.max(0, inputs.iloeBasicSalaryMonthly || monthlyGrossSalary);

  const setPensionContributionSalaryMonthly = (
    pensionContributionSalaryMonthly: number,
  ) => {
    setInputs((current) => ({
      ...current,
      pensionContributionSalaryMonthly: Math.min(
        Math.max(
          0,
          pensionContributionSalaryMonthly,
          selectedCategory.monthlyMinimum ?? 0,
        ),
        pensionContributionSalaryMax,
      ),
    }));
  };

  const setIloeBasicSalaryMonthly = (iloeBasicSalaryMonthly: number) => {
    const nextBasicSalary = Math.max(0, iloeBasicSalaryMonthly);

    setInputs((current) => ({
      ...current,
      iloeBasicSalaryMonthly: nextBasicSalary,
      unemploymentInsuranceCategory:
        current.unemploymentInsuranceCategory === "notCovered"
          ? "notCovered"
          : getUaeIloeCategoryFromBasicSalary(nextBasicSalary),
    }));
  };

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
                setInputs((current) => ({
                  ...current,
                  employeeCategory,
                  pensionContributionSalaryMonthly: 0,
                }))
              }
              options={UAE_EMPLOYEE_CATEGORY_OPTIONS}
              description={selectedCategory.salaryBaseDescription}
            />
            <PayFrequencyField
              value={inputs.payFrequency}
              onChange={setPayFrequency}
            />
            <SelectField
              id="ae-unemployment-insurance"
              label="Unemployment Insurance"
              value={inputs.unemploymentInsuranceCategory}
              onChange={(
                unemploymentInsuranceCategory: UAEUnemploymentInsuranceCategory,
              ) =>
                setInputs((current) => ({
                  ...current,
                  unemploymentInsuranceCategory,
                  iloeBasicSalaryMonthly:
                    unemploymentInsuranceCategory === "notCovered"
                      ? 0
                      : current.iloeBasicSalaryMonthly || current.grossSalary / 12,
                }))
              }
              options={UAE_UNEMPLOYMENT_INSURANCE_OPTIONS}
              description={selectedUnemploymentInsurance.description}
            />
            {inputs.unemploymentInsuranceCategory !== "notCovered" ? (
              <CurrencyAmountField
                id="ae-iloe-basic-salary"
                label="Basic Salary for ILOE (Monthly)"
                value={iloeBasicSalaryMonthly}
                onChange={setIloeBasicSalaryMonthly}
                currency={currency}
                min={0}
                step={100}
                description={`Monthly basic salary determines whether the employee-paid ILOE premium is AED 5 or AED 10. Category 1 applies up to AED ${UAE_ILOE_CATEGORY_1_BASIC_SALARY_MAX.toLocaleString()}.`}
              />
            ) : null}
            {hasPension ? (
              <CurrencyAmountField
                id="ae-pension-contribution-salary"
                label="Monthly Pension Contribution Salary"
                value={pensionContributionSalaryMonthly}
                onChange={setPensionContributionSalaryMonthly}
                currency={currency}
                min={0}
                max={pensionContributionSalaryMax}
                step={500}
                description="Contribution account salary used for GPSSA or GCC extension employee pension. Category floors and caps are applied again in the calculator."
              />
            ) : null}
          </CalculatorFieldGrid>

          <InfoPanel title="UAE assumptions" tone="neutral">
            Salary income is modeled with 0% UAE personal income tax. GPSSA
            pension is modeled for UAE nationals using private-sector settings,
            and GCC categories use GPSSA insurance extension rates on the
            selected monthly contribution salary. Covered federal/private
            employees can include the employee-paid ILOE
            unemployment-insurance premium based on monthly basic salary. Visa costs,
            free-zone or corporate tax positions, self-employment,
            end-of-service gratuity, medical insurance, and employer-specific
            benefits are excluded.
          </InfoPanel>
        </div>
      }
      seoInfo={<AETaxInfo />}
      contributionsTitle="UAE Payroll Coverage Notes"
      contributionsDescription="Personal income tax is 0%; ILOE and GPSSA/GCC employee coverage are selected above"
      contributionsEmptyState="Salary income is modeled with 0% UAE personal income tax. GPSSA/GCC pension coverage and employee-paid unemployment insurance are selected above where applicable. End-of-service, medical insurance, visa costs, and employer-specific benefits need employer-plan facts rather than annual employee deduction sliders."
    />
  );
}

function AETaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">United Arab Emirates</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Personal Income Tax</strong> – UAE employment salary is modeled at 0% personal income tax.</li>
        <li><strong className="text-zinc-300">Employee Category</strong> – foreign/expat employees default to no UAE pension deduction; UAE and selected GCC nationals use modeled statutory pension rates.</li>
        <li><strong className="text-zinc-300">UAE National Pension</strong> – new private-sector GPSSA model uses an 11% employee rate on contribution salary with AED 3,000 monthly floor and AED 70,000 monthly cap.</li>
        <li><strong className="text-zinc-300">Legacy / GCC Pension</strong> – legacy UAE private-sector and GCC extension categories use the employee rates and selected monthly contribution salary exposed by the calculator.</li>
        <li><strong className="text-zinc-300">ILOE Unemployment Insurance</strong> – covered employees can include the employee-paid AED 5 or AED 10 monthly unemployment-insurance premium based on monthly basic salary.</li>
        <li><strong className="text-zinc-300">Take-home Formula</strong> – gross salary minus employee pension contributions and selected ILOE premium equals estimated net salary because salary income tax is modeled as zero.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Employer pension and government support amounts are shown for context where modeled, but only employee pension and selected ILOE premiums reduce take-home pay. End-of-service gratuity, private medical insurance, visa or free-zone costs, and employer-specific benefits need separate facts.</p>
    </div>
  );
}

function AETaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How United Arab Emirates Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <AETaxInfoContent />
      </div>
    </section>
  );
}
