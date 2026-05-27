"use client";

import {
  BooleanSelectField,
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
  PA_CHARITABLE_DONATION_LIMIT,
  PA_EDUCATIONAL_INSURANCE_RATE,
  PA_EDUCATION_EXPENSE_LIMIT_PER_STUDENT,
  PA_MARRIED_PERSONAL_EXEMPTION,
  PA_MORTGAGE_INTEREST_LIMIT,
  PA_RETIREMENT_FUND_LIMIT,
  PA_SOCIAL_SECURITY_RATE,
} from "@/lib/countries/pa/constants/tax-year-2026";
import type {
  PACalculatorInputs,
  PAContributionInputs,
} from "@/lib/countries/pa/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function PACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<PACalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof PAContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof PAContributionInputs,
    amount: number,
  ) => {
    const limit = getLimit(key);

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
      },
    }));
  };

  const renderContributionSlider = (
    key: keyof PAContributionInputs,
    step: number,
  ) => {
    const limit = getLimit(key);

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key]?.name ?? key}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={step}
        currency={currency}
        description={contributionLimits[key]?.description}
      />
    );
  };

  const deductionInputs = [
    renderContributionSlider("retirementContribution", 100),
    renderContributionSlider("housingExpenses", 100),
    renderContributionSlider("educationExpenses", 100),
    renderContributionSlider(
      "medicalExpenses",
      Math.max(100, Math.round(getLimit("medicalExpenses") / 100)),
    ),
    renderContributionSlider("charitableDonations", 250),
  ].filter(Boolean);

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
            id="pa-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="pa-married"
            label="Married Personal Exemption"
            value={inputs.isMarried}
            onChange={(isMarried) =>
              setInputs((current) => ({ ...current, isMarried }))
            }
            trueLabel={`Claim USD ${PA_MARRIED_PERSONAL_EXEMPTION.toLocaleString()}`}
            falseLabel="Not claimed"
            description="Panama married individuals may claim a USD 800 personal exemption."
          />
          <NumberStepperField
            id="pa-education-students"
            label="Students With Education Expenses"
            value={inputs.educationStudents}
            onChange={(educationStudents) =>
              setInputs((current) => {
                const nextInputs = { ...current, educationStudents };
                const limit = getCountryCalculator(country).getContributionLimits(
                  nextInputs,
                ).educationExpenses?.limit ?? 0;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    educationExpenses: clampAmount(
                      current.contributions.educationExpenses ?? 0,
                      limit,
                    ),
                  },
                };
              })
            }
            min={0}
            max={10}
            description={`Education deductions are modeled at USD ${PA_EDUCATION_EXPENSE_LIMIT_PER_STUDENT.toLocaleString()} per selected student.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        deductionInputs.length > 0 ? (
          <div className="space-y-6">{deductionInputs}</div>
        ) : undefined
      }
      contributionsTitle="Panama Deductions"
      contributionsDescription="Modeled Panama resident deductions and approved retirement contributions"
      seoInfo={<PanamaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Panama-source employment salary with employee social
            security, educational insurance, the married exemption when
            selected, and common personal deductions documented for Panama.
          </p>
          <p className="mt-2">
            The calculator does not decide territorial-source disputes or
            foreign-earned-income exclusions. Use gross salary for the
            Panama-source employment income you want modeled.
          </p>
        </InfoPanel>
      }
    />
  );
}

function PanamaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Panama Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            Panama territorial salary brackets: 0% to USD 11,000, 15% up to USD
            50,000, then USD 5,850 plus 25% over USD 50,000.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            include employee social security at{" "}
            {(PA_SOCIAL_SECURITY_RATE * 100).toFixed(2)}% and educational
            insurance at {(PA_EDUCATIONAL_INSURANCE_RATE * 100).toFixed(2)}%.
          </li>
          <li>
            <strong className="text-zinc-300">Personal Deductions</strong>{" "}
            include the married exemption, mortgage interest up to USD{" "}
            {PA_MORTGAGE_INTEREST_LIMIT.toLocaleString()}, medical expenses
            incurred in Panama, education expenses, and authorised charity or
            non-profit dues up to USD{" "}
            {PA_CHARITABLE_DONATION_LIMIT.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Retirement Contributions</strong>{" "}
            are modeled for approved retirement funds up to the lower of 10% of
            annual gross income or USD {PA_RETIREMENT_FUND_LIMIT.toLocaleString()}{" "}
            per year.
          </li>
        </ul>
      </div>
    </section>
  );
}
