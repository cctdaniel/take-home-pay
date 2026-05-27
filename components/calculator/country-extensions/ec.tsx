"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
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
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  EC_2026_BASIC_FAMILY_BASKET,
  EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS,
  EC_INCOME_EXEMPTIONS_2026,
  EC_IESS_EMPLOYEE_RATE,
  EC_PERSONAL_EXPENSE_REBATE_RATE,
} from "@/lib/countries/ec/constants/tax-year-2026";
import type {
  ECCalculatorInputs,
  ECIncomeExemptionType,
} from "@/lib/countries/ec/types";

const INCOME_EXEMPTION_OPTIONS: Array<{
  value: ECIncomeExemptionType;
  label: string;
}> = [
  { value: "none", label: "No income exemption" },
  { value: "olderAdult", label: "Older adult (65+)" },
  { value: "disability30to49", label: "Disability/sustituto 30%-49%" },
  { value: "disability50to74", label: "Disability/sustituto 50%-74%" },
  { value: "disability75to84", label: "Disability/sustituto 75%-84%" },
  { value: "disability85to100", label: "Disability/sustituto 85%-100%" },
];

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function ECCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ECCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const expenseLimit = contributionLimits.qualifyingExpenses?.limit ?? 0;

  const clampQualifyingExpenses = (nextInputs: ECCalculatorInputs) => {
    const nextLimit = getCountryCalculator(country).getContributionLimits(
      nextInputs,
    ).qualifyingExpenses?.limit ?? 0;

    return {
      ...nextInputs,
      contributions: {
        ...nextInputs.contributions,
        qualifyingExpenses: clampAmount(
          nextInputs.contributions.qualifyingExpenses ?? 0,
          nextLimit,
        ),
      },
    };
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
            id="ec-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberStepperField
            id="ec-family-dependents"
            label="Registered Family Dependents"
            value={inputs.familyDependents}
            onChange={(familyDependents) =>
              setInputs((current) =>
                clampQualifyingExpenses({ ...current, familyDependents }),
              )
            }
            min={0}
            max={5}
            description="SRI caps use 7 baskets with no dependents, then 9, 11, 14, 17, or 20 baskets for 1 to 5+ dependents."
          />
          <SelectField<ECIncomeExemptionType>
            id="ec-income-exemption"
            label="Income Exemption"
            value={inputs.incomeExemptionType}
            onChange={(incomeExemptionType) =>
              setInputs((current) => ({ ...current, incomeExemptionType }))
            }
            options={INCOME_EXEMPTION_OPTIONS}
            description="SRI taxable-base exemption for older adults or accredited disability/sustituto status. Use only one; the official benefits are not stacked."
          />
          <BooleanSelectField
            id="ec-disability-catastrophic"
            label="Disability/Catastrophic Expense Limit"
            value={inputs.hasDisabilityOrCatastrophicIllness}
            onChange={(hasDisabilityOrCatastrophicIllness) =>
              setInputs((current) =>
                clampQualifyingExpenses({
                  ...current,
                  hasDisabilityOrCatastrophicIllness,
                }),
              )
            }
            trueLabel="Use 100-basket limit"
            falseLabel="Use dependent limit"
            description="Applies the separate SRI 100-basket personal-expense rebate cap when the taxpayer or a family dependent qualifies."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        expenseLimit > 0 ? (
          <ContributionSlider
            label={contributionLimits.qualifyingExpenses.name}
            value={Math.min(
              inputs.contributions.qualifyingExpenses ?? 0,
              expenseLimit,
            )}
            onChange={(amount) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  qualifyingExpenses: clampAmount(amount, expenseLimit),
                },
              }))
            }
            max={expenseLimit}
            step={50}
            currency={currency}
            description={contributionLimits.qualifyingExpenses.description}
          />
        ) : undefined
      }
      contributionsTitle="SRI Personal Expense Rebate"
      contributionsDescription="Projected Ecuador personal expenses that generate an income-tax rebate at the SRI 2026 family-dependent cap"
      seoInfo={<EcuadorTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Ecuador resident employment income using the SRI 2026
            table, IESS employee contribution, and personal-expense rebate caps
            based on registered family dependents.
          </p>
          <p className="mt-2">
            The income-exemption selector models the SRI older-adult and
            disability/sustituto taxable-base exemptions. The
            disability/catastrophic expense switch is separate and applies the
            100-basic-family-basket personal-expense rebate limit.
          </p>
          <p className="mt-2">
            Category-level receipt validation is handled outside this annual
            estimate, and RIMPE or business regimes would need a separate
            income-type selector before they can be shown accurately.
          </p>
        </InfoPanel>
      }
    />
  );
}

function EcuadorTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Ecuador Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the SRI
            2026 fixed-fraction table for resident natural persons.
          </li>
          <li>
            <strong className="text-zinc-300">IESS</strong> is modeled at{" "}
            {(EC_IESS_EMPLOYEE_RATE * 100).toFixed(2)}% and reduces the
            income-tax base.
          </li>
          <li>
            <strong className="text-zinc-300">Older Adult / Disability Exemption</strong>{" "}
            subtracts the SRI income exemption when selected: USD{" "}
            {EC_INCOME_EXEMPTIONS_2026.olderAdult.amount.toLocaleString()} for
            older adults, or a percentage of two zero-rate basic fractions for
            accredited disability/sustituto status.
          </li>
          <li>
            <strong className="text-zinc-300">Personal Expenses</strong>{" "}
            generate an {(EC_PERSONAL_EXPENSE_REBATE_RATE * 100).toFixed(0)}%
            income-tax rebate on expenses up to the selected basket cap, using
            the January 2026 basic family basket of USD{" "}
            {EC_2026_BASIC_FAMILY_BASKET.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Special Health/Disability Limit</strong>{" "}
            applies up to{" "}
            {EC_DISABILITY_OR_CATASTROPHIC_ILLNESS_BASKETS.toLocaleString()}{" "}
            basic family baskets when selected.
          </li>
        </ul>
      </div>
    </section>
  );
}
