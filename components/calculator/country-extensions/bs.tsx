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
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  BS_NIB_AGE_65_PLUS_NOT_RETIRED_EMPLOYEE_RATE,
  BS_NIB_EMPLOYER_ONLY_RATE,
  BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE,
  BS_NIB_HALF_WEEKLY_CEILING,
  BS_NIB_STANDARD_EMPLOYEE_RATE,
  BS_NIB_WEEKLY_CEILING,
} from "@/lib/countries/bs/constants/tax-year-2026";
import type {
  BSCalculatorInputs,
  BSNibCategory,
} from "@/lib/countries/bs/types";

const NIB_CATEGORY_OPTIONS: Array<{ value: BSNibCategory; label: string }> = [
  { value: "standard", label: "Standard employed person" },
  {
    value: "age65PlusNotRetired",
    label: "Age 65+ not receiving Retirement Benefit",
  },
  {
    value: "age60to64RetirementBenefit",
    label: "Age 60-64 receiving Retirement Benefit",
  },
  {
    value: "age65PlusRetirementBenefit",
    label: "Age 65+ receiving Retirement Benefit",
  },
  { value: "summerEmployment", label: "Summer employment" },
];

function isEmployerOnlyCategory(nibCategory: BSNibCategory) {
  return (
    nibCategory === "age60to64RetirementBenefit" ||
    nibCategory === "age65PlusRetirementBenefit" ||
    nibCategory === "summerEmployment"
  );
}

export default function BSCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BSCalculatorInputs>(country);
  const weeklyCashGross = Math.max(0, inputs.grossSalary) / 52;
  const employerOnlyCategory = isEmployerOnlyCategory(inputs.nibCategory);
  const categoryWeeklyCeiling =
    inputs.nibCategory === "age60to64RetirementBenefit"
      ? BS_NIB_HALF_WEEKLY_CEILING
      : BS_NIB_WEEKLY_CEILING;
  const weeklyGratuitiesMax = employerOnlyCategory
    ? 0
    : Math.min(weeklyCashGross, categoryWeeklyCeiling);
  const weeklyFormalGratuities = Math.min(
    Math.max(0, inputs.weeklyFormalGratuities ?? 0),
    weeklyGratuitiesMax,
  );
  const weeklyNibMax = Math.min(
    Math.max(0, weeklyCashGross - weeklyFormalGratuities),
    Math.max(0, categoryWeeklyCeiling - weeklyFormalGratuities),
  );

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
            id="bs-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="bs-nib-category"
            label="National Insurance Category"
            value={inputs.nibCategory}
            onChange={(nibCategory) =>
              setInputs((current) => ({
                ...current,
                nibCategory,
                nibInsurableWeeklyWage: 0,
                weeklyFormalGratuities: isEmployerOnlyCategory(nibCategory)
                  ? 0
                  : current.weeklyFormalGratuities,
              }))
            }
            options={NIB_CATEGORY_OPTIONS}
            description="Controls the employee NIB rate and whether the category is employee-deducted or employer-only."
          />
          <CurrencyAmountField
            id="bs-nib-insurable-weekly-wage"
            label="Weekly NIB Basic Wage"
            value={Math.min(
              inputs.nibInsurableWeeklyWage || weeklyNibMax,
              weeklyNibMax,
            )}
            onChange={(nibInsurableWeeklyWage) =>
              setInputs((current) => ({
                ...current,
                nibInsurableWeeklyWage: Math.min(
                  Math.max(0, nibInsurableWeeklyWage),
                  weeklyNibMax,
                ),
              }))
            }
            currency={currency}
            min={0}
            max={weeklyNibMax}
            step={10}
            description={
              inputs.nibCategory === "age60to64RetirementBenefit"
                ? `Leave at 0 to use weekly gross salary capped at the half-ceiling BSD ${BS_NIB_HALF_WEEKLY_CEILING.toLocaleString()} limit for this Retirement Benefit category.`
                : `Leave at 0 to use weekly gross salary capped at the official BSD ${BS_NIB_WEEKLY_CEILING.toLocaleString()} ceiling after formal gratuities.`
            }
          />
          {!employerOnlyCategory ? (
            <CurrencyAmountField
              id="bs-weekly-formal-gratuities"
              label="Weekly Formal Tips / Gratuities"
              value={weeklyFormalGratuities}
              onChange={(weeklyFormalGratuities) =>
                setInputs((current) => ({
                  ...current,
                  weeklyFormalGratuities: Math.min(
                    Math.max(0, weeklyFormalGratuities),
                    weeklyGratuitiesMax,
                  ),
                  nibInsurableWeeklyWage: Math.min(
                    current.nibInsurableWeeklyWage,
                    weeklyNibMax,
                  ),
                }))
              }
              currency={currency}
              min={0}
              max={weeklyGratuitiesMax}
              step={10}
              description="Formal tips or gratuities that are part of gross pay, not extra salary. NIB applies the gratuity rate separately and reduces the remaining basic-wage ceiling."
            />
          ) : null}
        </CalculatorFieldGrid>
      }
      contributionsTitle="Bahamas Payroll Coverage Notes"
      contributionsDescription="National Insurance category is selected above; ordinary salary has no personal income tax"
      contributionsEmptyState="The National Insurance category and formal gratuity amount are selected above and deducted automatically where employee NIB applies. Voluntary insured-person NIB is for people outside ordinary insurable employment, so it is not shown as a salary tax-saving slider."
      seoInfo={<BahamasTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            The Bahamas has no personal income tax on ordinary employment
            salary in this calculator. Take-home pay is reduced by the employee
            National Insurance deduction where the selected category applies,
            based on the selected weekly NIB basic wage and any formally paid
            gratuities.
          </p>
          <p className="mt-2">
            Retirement Benefit recipient and summer-employment categories are
            available above because they change the employee deduction to 0%.
            Employer-only NIB is shown as result context, while business
            licence tax, self-employed NIB, voluntary insured-person NIB, and
            property or stamp taxes are not employee payroll deductions.
          </p>
        </InfoPanel>
      }
    />
  );
}

function BahamasTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Bahamas Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> is 0% for
            ordinary employment salary in this model.
          </li>
          <li>
            <strong className="text-zinc-300">National Insurance</strong> uses
            the selected weekly NIB basic wage plus formal gratuities, capped
            together at BSD {BS_NIB_WEEKLY_CEILING.toLocaleString()} per week.
          </li>
          <li>
            <strong className="text-zinc-300">Employee NIB Rate</strong> is{" "}
            {(BS_NIB_STANDARD_EMPLOYEE_RATE * 100).toFixed(2)}% for standard
            employed persons, or{" "}
            {(BS_NIB_AGE_65_PLUS_NOT_RETIRED_EMPLOYEE_RATE * 100).toFixed(2)}%
            for the age 65+ not receiving Retirement Benefit category.
          </li>
          <li>
            <strong className="text-zinc-300">Formal Gratuities</strong> use
            the NIB employee gratuity rate of{" "}
            {(BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE * 100).toFixed(2)}% and
            reduce the remaining basic-wage ceiling.
          </li>
          <li>
            <strong className="text-zinc-300">Employer-Only Categories</strong>{" "}
            include the modeled Retirement Benefit recipient and summer
            employment cases; they show 0% employee deduction and{" "}
            {(BS_NIB_EMPLOYER_ONLY_RATE * 100).toFixed(0)}% employer context.
          </li>
        </ul>
      </div>
    </section>
  );
}
