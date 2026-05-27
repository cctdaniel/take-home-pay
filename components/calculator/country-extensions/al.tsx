"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
  AL_CHILD_EDUCATION_EXPENSE_LIMIT,
  AL_CHILD_EDUCATION_INCOME_LIMIT,
  AL_DEPENDENT_CHILD_DEDUCTION,
  AL_MAXIMUM_MONTHLY_SOCIAL_INSURANCE_SALARY,
  AL_MINIMUM_MONTHLY_CONTRIBUTION_SALARY,
  AL_VOLUNTARY_PENSION_DEDUCTION_LIMIT,
} from "@/lib/countries/al/constants/tax-year-2026";
import type { ALCalculatorInputs } from "@/lib/countries/al/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function ALCountryExtension(props: CountryCalculatorExtensionProps) {
  const { country } = props;
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ALCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (
    key: "retirementContribution" | "educationExpenses",
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
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
            id="al-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="al-employment-allowance"
            label="Employment Allowance"
            value={inputs.appliesEmploymentAllowance}
            onChange={(appliesEmploymentAllowance) =>
              setInputs((current) => ({
                ...current,
                appliesEmploymentAllowance,
              }))
            }
            trueLabel="Applied"
            falseLabel="Not applied"
            trueFirst
            description="Use Applied for the main salary/annual estimate. Use Not applied for a secondary or no-allowance payroll scenario."
          />
          <CurrencyAmountField
            id="al-taxable-benefits"
            label="Taxable Benefits In Kind"
            value={inputs.taxableNonCashBenefits}
            onChange={(taxableNonCashBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonCashBenefits: Math.max(0, taxableNonCashBenefits),
              }))
            }
            currency={currency}
            step={5000}
            description="Recurring taxable non-cash employment remuneration included in the modeled income-tax and contribution base."
          />
          <BooleanSelectField
            id="al-family-diva-claimant"
            label="DIVA Family Deductions"
            value={inputs.claimsFamilyDivaDeductions}
            onChange={(claimsFamilyDivaDeductions) =>
              setInputs((current) => ({
                ...current,
                claimsFamilyDivaDeductions,
                numberOfDependentChildren: claimsFamilyDivaDeductions
                  ? current.numberOfDependentChildren
                  : 0,
                contributions: {
                  ...current.contributions,
                  educationExpenses: claimsFamilyDivaDeductions
                    ? current.contributions.educationExpenses
                    : 0,
                },
              }))
            }
            trueLabel="This taxpayer claims"
            falseLabel="Another family member claims"
            trueFirst
            description="Child and education deductions are DIVA annual-return deductions claimed by the eligible family member."
          />
          <NumberStepperField
            id="al-dependent-children"
            label="Dependent Children Under 18"
            value={inputs.numberOfDependentChildren}
            onChange={(numberOfDependentChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfDependentChildren,
                contributions: {
                  ...current.contributions,
                  educationExpenses:
                    numberOfDependentChildren > 0
                      ? current.contributions.educationExpenses
                      : 0,
                },
              }))
            }
            min={0}
            max={10}
            description={`ALL ${AL_DEPENDENT_CHILD_DEDUCTION.toLocaleString()} annual DIVA deduction per eligible child when this taxpayer claims the family deductions.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {(["retirementContribution", "educationExpenses"] as const).map(
            (key) => {
              const limit = contributionLimits[key];

              if (!limit || limit.limit <= 0) {
                return null;
              }

              return (
                <ContributionSlider
                  key={key}
                  label={limit.name}
                  value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                  onChange={(amount) => setContribution(key, amount)}
                  max={limit.limit}
                  step={key === "educationExpenses" ? 1000 : 5000}
                  currency={currency}
                  description={limit.description}
                />
              );
            },
          )}
          {contributionLimits.educationExpenses?.limit === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              Children&apos;s education expenses appear as a slider when this
              taxpayer claims DIVA family deductions, at least one dependent
              child is entered, and modeled employment/business income is not
              above ALL {AL_CHILD_EDUCATION_INCOME_LIMIT.toLocaleString()}.
              The official annual cap is ALL{" "}
              {AL_CHILD_EDUCATION_EXPENSE_LIMIT.toLocaleString()}, but the
              deduction stays at zero when those conditions are not met.
            </div>
          ) : null}
        </div>
      }
      contributionsTitle="Albania Pension and Deduction Inputs"
      contributionsDescription="Voluntary pension contributions plus annual-return child and education deductions"
      seoInfo={<AlbaniaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Albania resident employment salary with the annual
            employment allowance, 13%/23% income tax bands, taxable in-kind
            remuneration, employee social insurance, health insurance,
            deductible voluntary pension contributions, dependent-child
            deductions, and children&apos;s education expense deductions.
          </p>
          <p className="mt-2">
            The allowance switch covers main-salary versus secondary or
            no-allowance payroll scenarios. DIVA family deductions are separated
            because the child and education deductions are claimed by the
            eligible taxpayer rather than automatically by every salary earner.
          </p>
          <p className="mt-2">
            Employer social and health contributions, self-employment
            contribution bases, business income, investment income, rental
            income, treaty withholding applications, and document checks are
            separate Albanian return or payroll facts, so they are named in the
            results instead of hidden behind a generic catch-all sentence.
          </p>
        </InfoPanel>
      }
    />
  );
}

function AlbaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Albania Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Employment income</strong> uses
            the post-2025 annual allowance thresholds before the 13% and 23%
            tax rates; the allowance can be switched off for secondary or
            no-allowance salary modeling.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll contributions</strong>{" "}
            include employee social insurance with the modeled monthly floor and
            ceiling of ALL{" "}
            {AL_MINIMUM_MONTHLY_CONTRIBUTION_SALARY.toLocaleString()} to ALL{" "}
            {AL_MAXIMUM_MONTHLY_SOCIAL_INSURANCE_SALARY.toLocaleString()},
            plus health insurance at 1.7% of taxable employment remuneration.
          </li>
          <li>
            <strong className="text-zinc-300">Child deductions</strong> model
            ALL {AL_DEPENDENT_CHILD_DEDUCTION.toLocaleString()} per dependent
            child under 18 and education expenses up to ALL{" "}
            {AL_CHILD_EDUCATION_EXPENSE_LIMIT.toLocaleString()} when income is
            within the ALL {AL_CHILD_EDUCATION_INCOME_LIMIT.toLocaleString()}{" "}
            threshold.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary pensions</strong> are
            deductible up to the annualized minimum-wage threshold configured
            for 2026: ALL{" "}
            {AL_VOLUNTARY_PENSION_DEDUCTION_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
