"use client";

import {
  CalculatorFieldGrid,
  NumberStepperField,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  MU_CARER_WAGE_LIMIT,
  MU_CHARITY_DONATION_LIMIT,
  MU_DEPENDENT_DEDUCTION_AMOUNTS,
  MU_MEDICAL_INSURANCE_RELIEF_AMOUNTS,
  MU_PERSONAL_PENSION_LIMIT,
  MU_PRIVATE_SCHOOL_PER_CHILD_LIMIT,
  MU_TERTIARY_EDUCATION_PER_CHILD_LIMIT,
} from "@/lib/countries/mu/constants/tax-year-2026";
import type {
  MUCalculatorInputs,
  MUContributionInputs,
} from "@/lib/countries/mu/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function MUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<MUCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (
    key: keyof MUContributionInputs,
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? inputs.grossSalary;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
      },
    }));
  };

  const renderSlider = (key: keyof MUContributionInputs, step: number) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key].name}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={step}
        currency={currency}
        description={contributionLimits[key].description}
      />
    );
  };

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
            id="mu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberStepperField
            id="mu-dependents"
            label="Claimed Dependents"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfDependents,
                numberOfPrivateSchoolDependents: Math.min(
                  current.numberOfPrivateSchoolDependents,
                  numberOfDependents,
                ),
                numberOfTertiaryEducationDependents: Math.min(
                  current.numberOfTertiaryEducationDependents,
                  numberOfDependents,
                ),
              }))
            }
            min={0}
            max={4}
            description="MRA dependent deduction is capped at four dependents."
          />
          <NumberStepperField
            id="mu-private-school-dependents"
            label="Private-School Dependents"
            value={Math.min(
              inputs.numberOfPrivateSchoolDependents,
              inputs.numberOfDependents,
            )}
            onChange={(numberOfPrivateSchoolDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfPrivateSchoolDependents: Math.min(
                  numberOfPrivateSchoolDependents,
                  current.numberOfDependents,
                ),
              }))
            }
            min={0}
            max={inputs.numberOfDependents}
            description="Fee-paying private primary or secondary school deduction cap is Rs 60,000 per child."
          />
          <NumberStepperField
            id="mu-tertiary-education-dependents"
            label="Tertiary-Education Dependents"
            value={Math.min(
              inputs.numberOfTertiaryEducationDependents,
              inputs.numberOfDependents,
            )}
            onChange={(numberOfTertiaryEducationDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfTertiaryEducationDependents: Math.min(
                  numberOfTertiaryEducationDependents,
                  current.numberOfDependents,
                ),
              }))
            }
            min={0}
            max={inputs.numberOfDependents}
            description="Non-sponsored full-time undergraduate or postgraduate deduction cap is Rs 500,000 per child."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {renderSlider("retirementContribution", 1000)}
          {renderSlider("insurancePremiums", 1000)}
          {renderSlider("charitableDonations", 1000)}
          {renderSlider("educationExpenses", 1000)}
          {renderSlider("tertiaryEducationExpenses", 5000)}
          {renderSlider("carerWages", 1000)}
          {renderSlider("housingExpenses", 1000)}
          {renderSlider("qualifyingExpenses", 1000)}
        </div>
      }
      contributionsTitle="Mauritius Reliefs And Deductions"
      contributionsDescription="MRA resident reliefs for dependents, pension, medical insurance, charity, school fees, housing, and green investments"
      seoInfo={<MauritiusTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Mauritius resident employment income for the income year
            ending 30 June 2026, including CSG, MRA tax bands, dependent
            deductions, and the main resident reliefs shown above.
          </p>
          <p className="mt-2">
            Dependent income tests, CSG income allowance, Revenue Minimum
            Garantie, NSF employee contribution, and employer-side payroll items
            are not included in this salary-only page.
          </p>
        </InfoPanel>
      }
    />
  );
}

function MauritiusTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Mauritius Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Dependents</strong> use MRA
            deductions of Rs{" "}
            {MU_DEPENDENT_DEDUCTION_AMOUNTS[1].toLocaleString()} to Rs{" "}
            {MU_DEPENDENT_DEDUCTION_AMOUNTS[4].toLocaleString()} depending on
            count.
          </li>
          <li>
            <strong className="text-zinc-300">Pension And Medical</strong>{" "}
            reliefs are capped at Rs {MU_PERSONAL_PENSION_LIMIT.toLocaleString()}{" "}
            for approved personal pension and medical insurance caps of Rs{" "}
            {MU_MEDICAL_INSURANCE_RELIEF_AMOUNTS[0].toLocaleString()} for self
            plus dependent caps.
          </li>
          <li>
            <strong className="text-zinc-300">Other Reliefs</strong> include
            electronic charity donations up to Rs{" "}
            {MU_CHARITY_DONATION_LIMIT.toLocaleString()} and private-school
            fees up to Rs {MU_PRIVATE_SCHOOL_PER_CHILD_LIMIT.toLocaleString()}{" "}
            per eligible dependent, tertiary education up to Rs{" "}
            {MU_TERTIARY_EDUCATION_PER_CHILD_LIMIT.toLocaleString()} per
            eligible dependent, and carer wages up to Rs{" "}
            {MU_CARER_WAGE_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
