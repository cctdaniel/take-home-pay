"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import {
  BR_DEPENDENT_ANNUAL_DEDUCTION,
  BR_EDUCATION_ANNUAL_LIMIT_PER_PERSON,
  BR_SIMPLIFIED_ANNUAL_DEDUCTION,
  BR_THIRTEENTH_SALARY_MONTHS,
} from "@/lib/countries/br/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  BRCalculatorInputs,
  BRSalaryPackageMode,
} from "@/lib/countries/br/types";
import { formatCurrency } from "@/lib/format";

const BR_SALARY_PACKAGE_OPTIONS = [
  {
    value: "includedInGross",
    label: "Included in gross",
  },
  {
    value: "additionalToGross",
    label: "Add statutory 13th salary",
  },
  {
    value: "none",
    label: "Not paid / exclude",
  },
] satisfies Array<{ value: BRSalaryPackageMode; label: string }>;

export default function BrazilCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BRCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const pensionLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const educationLimit = contributionLimits.educationExpenses?.limit ?? 0;

  const setContribution = (
    key: keyof BRCalculatorInputs["contributions"],
    amount: number,
    max = Number.POSITIVE_INFINITY,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.min(Math.max(0, amount), max),
      },
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
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="br-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="br-salary-package"
            label="Brazil Salary Package"
            value={inputs.salaryPackageMode}
            onChange={(salaryPackageMode) =>
              setInputs((current) => ({ ...current, salaryPackageMode }))
            }
            options={BR_SALARY_PACKAGE_OPTIONS}
            description="Controls whether annual gross already includes Brazil's 13th salary."
          />
          <NumberStepperField
            id="br-dependents"
            label="Dependents"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfDependents,
                contributions: {
                  ...current.contributions,
                  educationExpenses: Math.min(
                    current.contributions.educationExpenses,
                    (1 + numberOfDependents) *
                      BR_EDUCATION_ANNUAL_LIMIT_PER_PERSON,
                  ),
                },
              }))
            }
            min={0}
            max={10}
            description={`${formatCurrency(BR_DEPENDENT_ANNUAL_DEDUCTION, currency)} annual deduction per dependent.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="PGBL Private Pension"
            value={inputs.contributions.retirementContribution}
            onChange={(amount) =>
              setContribution("retirementContribution", amount, pensionLimit)
            }
            max={pensionLimit}
            step={Math.max(100, Math.round(pensionLimit / 100))}
            currency={currency}
            description="PGBL/FAPI deduction modeled up to 12% of annual taxable earnings."
          />
          <ContributionSlider
            label="Education Expenses"
            value={inputs.contributions.educationExpenses}
            onChange={(amount) =>
              setContribution("educationExpenses", amount, educationLimit)
            }
            max={educationLimit}
            step={100}
            currency={currency}
            description={`Receita Federal 2026 cap: ${formatCurrency(BR_EDUCATION_ANNUAL_LIMIT_PER_PERSON, currency)} per taxpayer/dependent.`}
          />
          <CurrencyAmountField
            id="br-medical-expenses"
            label="Medical Expenses"
            value={inputs.contributions.medicalExpenses}
            onChange={(amount) => setContribution("medicalExpenses", amount)}
            currency={currency}
            min={0}
            step={100}
            description="Unreimbursed medical expenses are modeled as uncapped legal deductions when the complete return beats the simplified discount."
          />
        </div>
      }
      contributionsTitle="Brazil IRPF Legal Deductions"
      contributionsDescription="Dependents, PGBL, education, and medical deductions compared with the simplified discount"
      infoCard={
        <InfoPanel title="Brazil IRPF Scope">
          <p>
            This models resident salary income with the 2026 annual IRPF table,
            employee INSS, the annual low-income IRPF reduction, dependents,
            education, medical expenses, PGBL/FAPI deductions, and the 13th
            salary.
          </p>
          <p className="mt-2">
            The calculator compares annual-return deductions with the{" "}
            {formatCurrency(BR_SIMPLIFIED_ANNUAL_DEDUCTION, currency)}{" "}
            simplified annual discount and uses the better taxable base. The
            modeled 13th salary is handled separately for INSS and exclusive
            IRRF, while employer-only FGTS, alimony, dependent income inclusion,
            incentivized donations, and carnê-leão/self-employment rules remain
            outside this salary view.
          </p>
        </InfoPanel>
      }
      seoInfo={<BrazilTaxInfo />}
    />
  );
}

function BrazilTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Brazil Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">IRPF</strong> - salary is taxed
            under the 2026 Receita Federal annual progressive table after
            modeled deductions.
          </li>
          <li>
            <strong className="text-zinc-300">INSS</strong> - employee social
            security is calculated with the 2026 progressive contribution table
            and treated as a pre-tax legal deduction.
          </li>
          <li>
            <strong className="text-zinc-300">13th Salary</strong> - can be
            included in annual gross, added on top, or excluded. The modeled
            statutory amount is{" "}
            {BR_THIRTEENTH_SALARY_MONTHS === 1
              ? "one extra month"
              : `${BR_THIRTEENTH_SALARY_MONTHS} extra months`}{" "}
            of ordinary salary and is taxed separately for IRRF.
          </li>
          <li>
            <strong className="text-zinc-300">Complete vs Simplified</strong> -
            dependents, PGBL, education, and medical expenses are compared with
            the simplified annual discount before tax is calculated.
          </li>
        </ul>
      </div>
    </section>
  );
}
