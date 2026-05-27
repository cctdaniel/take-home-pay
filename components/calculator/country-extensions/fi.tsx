"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
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
  FI_COMMUTING_EXPENSE_DEDUCTION_2026,
  FI_HOUSEHOLD_EXPENSE_CREDIT_2026,
  FI_INCOME_PRODUCTION_EXPENSES_2026,
  FI_VOLUNTARY_PENSION_INSURANCE_2026,
} from "@/lib/countries/fi/constants/tax-year-2026";
import type {
  FICalculatorInputs,
  FIContributionInputs,
  FITaxRegime,
} from "@/lib/countries/fi/types";

const FI_TAX_REGIME_OPTIONS: Array<{
  value: FITaxRegime;
  label: string;
}> = [
  { value: "ordinary", label: "Ordinary resident salary" },
  { value: "keyEmployee", label: "Foreign key employee" },
];

export default function FICountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<FICalculatorInputs>(country);
  const isKeyEmployee = inputs.taxRegime === "keyEmployee";
  const updateContribution = (
    key: keyof FIContributionInputs,
    value: number,
    max: number,
  ) =>
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.min(Math.max(0, value), max),
      },
    }));
  const updateUncappedContribution = (
    key: keyof FIContributionInputs,
    value: number,
  ) =>
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.max(0, value),
      },
    }));

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
            id="fi-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberField
            id="fi-age"
            label="Age"
            value={inputs.age}
            onChange={(age) =>
              setInputs((current) => ({
                ...current,
                age: Math.min(Math.max(0, Math.floor(age)), 100),
              }))
            }
            min={0}
            max={100}
            fallbackValue={30}
            description="Used for age-banded Finnish employee pension, unemployment, and daily-allowance contribution rules."
          />
          <SelectField
            id="fi-tax-regime"
            label="Tax Regime"
            value={inputs.taxRegime}
            onChange={(taxRegime) =>
              setInputs((current) => ({ ...current, taxRegime }))
            }
            options={FI_TAX_REGIME_OPTIONS}
            description="Use only with a valid Finnish key employee tax-at-source card."
          />
          <CurrencyAmountField
            id="fi-taxable-fringe-benefits"
            label="Taxable Fringe Benefits"
            value={inputs.taxableFringeBenefits}
            onChange={(taxableFringeBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableFringeBenefits: Math.max(0, taxableFringeBenefits),
              }))
            }
            currency={currency}
            step={100}
            description="Annual Vero taxable value of employer-provided fringe benefits; increases tax and social-insurance bases but not cash salary."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Finland Tax Card Deductions and Credits"
      contributionsDescription={
        isKeyEmployee
          ? "No ordinary deductions are available for key-employee source-tax wages"
          : "Finnish deductions and credits commonly reported on a tax card or return"
      }
      contributions={
        !isKeyEmployee ? (
          <div className="space-y-6">
            <ContributionSlider
              label="Commuting expenses"
              value={inputs.contributions.commutingExpenses}
              onChange={(value) =>
                updateContribution(
                  "commutingExpenses",
                  value,
                  FI_COMMUTING_EXPENSE_DEDUCTION_2026.modeledExpenseMax,
                )
              }
              max={FI_COMMUTING_EXPENSE_DEDUCTION_2026.modeledExpenseMax}
              step={100}
              currency={currency}
              description="Report total lowest-cost commuting expenses; Vero subtracts the EUR 900 liability and caps the deduction at EUR 7,000."
            />
            <CurrencyAmountField
              id="fi-unemployment-fund-fees"
              label="Unemployment Fund Fees"
              value={inputs.contributions.unemploymentFundFees}
              onChange={(value) =>
                updateUncappedContribution("unemploymentFundFees", value)
              }
              currency={currency}
              step={10}
              description="Deductible in 2026 when paid to an unemployment fund. Trade union fees are no longer modeled because Vero says they are not deductible from 2026."
            />
            <CurrencyAmountField
              id="fi-other-production-expenses"
              label="Other Income-Production Expenses"
              value={inputs.contributions.otherIncomeProductionExpenses}
              onChange={(value) =>
                updateUncappedContribution(
                  "otherIncomeProductionExpenses",
                  value,
                )
              }
              currency={currency}
              step={50}
              description={`Tools, data connections, professional literature, or separate-workspace costs. Modeled only when the total exceeds Vero's EUR ${FI_INCOME_PRODUCTION_EXPENSES_2026.automaticDeduction.toLocaleString()} automatic deduction.`}
            />
            <ContributionSlider
              label="Household work expenses"
              value={inputs.contributions.householdWorkExpenses}
              onChange={(value) =>
                updateContribution(
                  "householdWorkExpenses",
                  value,
                  FI_HOUSEHOLD_EXPENSE_CREDIT_2026.modeledWorkExpenseMax,
                )
              }
              max={FI_HOUSEHOLD_EXPENSE_CREDIT_2026.modeledWorkExpenseMax}
              step={100}
              currency={currency}
              description="General household-work credit proxy: 35% of eligible work cost less EUR 150, capped at EUR 1,600."
            />
            <ContributionSlider
              label="Voluntary pension / PS savings"
              value={inputs.contributions.voluntaryPensionInsurance}
              onChange={(value) =>
                updateContribution(
                  "voluntaryPensionInsurance",
                  value,
                  FI_VOLUNTARY_PENSION_INSURANCE_2026.contributionLimit,
                )
              }
              max={FI_VOLUNTARY_PENSION_INSURANCE_2026.contributionLimit}
              step={100}
              currency={currency}
              description="Modeled as Vero's EUR 5,000 capital-income deduction with a 30% deficit credit against earned-income tax when no capital income is supplied."
            />
          </div>
        ) : undefined
      }
      contributionsEmptyState="Key-employee source tax is final for the covered wages, so ordinary commuting, household, and voluntary-pension deductions are not applied to that income."
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Finland employment salary for a full tax year
            or the selected foreign key employee tax-at-source treatment.
          </p>
          <p className="mt-2">
            The foreign key employee option applies the 2026 25% tax at source
            rate to wages, while ordinary employee pension, unemployment, and
            daily allowance contributions remain modeled separately.
          </p>
          <p className="mt-2">
            Exact municipality, church tax, YLE tax, the age-53-to-62 pension
            surcharge no longer applies in 2026 according to Vero&apos;s published
            rates. Exact municipality, church tax, YLE tax, family benefits,
            exact pension-insurance upper-age transitions, and capital-income
            ordering need taxpayer-specific facts. Ordinary commuting,
            unemployment fund, income-production, household, voluntary
            pension/PS savings, and taxable-fringe-benefit inputs are shown
            explicitly rather than hidden in the notes.
          </p>
        </InfoPanel>
      }
      seoInfo={<FinlandTaxInfo />}
    />
  );
}

function FinlandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Finland Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Ordinary Salary</strong> uses the
            2026 state tax scale proxy, average municipal rate, employee pension,
            unemployment, health-care, and daily-allowance contributions.
          </li>
          <li>
            <strong className="text-zinc-300">Fringe Benefits</strong> use the
            annual taxable value reported or calculated under Vero fringe-benefit
            rules. They increase wage tax and employee social-insurance bases
            but do not increase cash take-home pay.
          </li>
          <li>
            <strong className="text-zinc-300">Commuting Expenses</strong> reduce
            taxable income after Vero&apos;s EUR 900 personal-liability amount
            and EUR 7,000 deduction cap.
          </li>
          <li>
            <strong className="text-zinc-300">Income-Production Expenses</strong>{" "}
            include 2026 unemployment fund fees and other wage-income expenses
            such as tools or data connections when they exceed the automatic EUR{" "}
            {FI_INCOME_PRODUCTION_EXPENSES_2026.automaticDeduction.toLocaleString()}{" "}
            deduction.
          </li>
          <li>
            <strong className="text-zinc-300">Household Work Credit</strong>{" "}
            models the ordinary 2026 credit using the 2025/2026 general work
            cost rate, threshold, and EUR 1,600 cap.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary Pension / PS Savings</strong>{" "}
            are capped at EUR 5,000 and modeled as a 30% deficit credit against
            earned-income tax when no capital income is supplied.
          </li>
          <li>
            <strong className="text-zinc-300">Key Employee</strong> applies the
            25% tax-at-source treatment for qualifying wages and does not apply
            ordinary deductions to those wages.
          </li>
        </ul>
      </div>
    </section>
  );
}
