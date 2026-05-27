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
  CO_ARTICLE_336_DEPENDENT_DEDUCTION,
  CO_ARTICLE_336_DEPENDENT_MAX,
  CO_ELECTRONIC_INVOICE_DEDUCTION_LIMIT,
  CO_MORTGAGE_INTEREST_LIMIT,
  CO_PREPAID_HEALTH_LIMIT,
  CO_UVT,
} from "@/lib/countries/co/constants/tax-year-2026";
import type {
  COCalculatorInputs,
  COContributionInputs,
} from "@/lib/countries/co/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function COCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<COCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof COContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof COContributionInputs,
    amount: number,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, getLimit(key)),
      },
    }));
  };

  const renderSlider = (
    key: keyof COContributionInputs,
    fallbackLabel: string,
    fallbackDescription: string,
    step: number,
  ) => {
    const limit = getLimit(key);

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key]?.name ?? fallbackLabel}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={step}
        currency={currency}
        description={contributionLimits[key]?.description ?? fallbackDescription}
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
            id="co-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberStepperField
            id="co-dependents"
            label="Tax Dependents"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfDependents,
              }))
            }
            min={0}
            max={CO_ARTICLE_336_DEPENDENT_MAX}
            description="Models the Article 387 dependent deduction and the Article 336 extra 72 UVT deduction per dependent."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {renderSlider(
            "retirementContribution",
            "Voluntary pension or AFC savings",
            "Voluntary pension or AFC savings within the remaining cédula general cap.",
            100000,
          )}
          {renderSlider(
            "insurancePremiums",
            "Prepaid medicine or health insurance",
            "Article 387 health payments capped at 16 UVT per month and by the remaining cédula general cap.",
            100000,
          )}
          {renderSlider(
            "housingExpenses",
            "Housing loan interest",
            "Deductible housing-loan interest capped at 1,200 UVT per year and by the remaining cédula general cap.",
            100000,
          )}
          {renderSlider(
            "qualifyingExpenses",
            "Electronic invoice deduction",
            "Enter the 1% deductible amount from eligible electronic-invoice purchases, capped at 240 UVT.",
            100000,
          )}
        </div>
      }
      contributionsTitle="Colombia Deductions and Exempt Income"
      contributionsDescription="Dependents, prepaid health, housing interest, voluntary pension/AFC, and electronic-invoice deductions"
      seoInfo={<ColombiaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Colombian resident employment income using the 2026 UVT,
            mandatory employee health and pension contributions, the pension
            solidarity fund, the 25% employment exemption, and selected cédula
            general deductions.
          </p>
          <p className="mt-2">
            The capped deductions share the 40% / 1,340 UVT annual cédula
            general limit after mandatory social contributions. Non-labour
            cédula income, withholding procedure selection, foreign tax credits,
            and alternative minimum-tax edge cases require separate filing facts
            before they can be shown as accurate salary controls.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ColombiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Colombia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">UVT</strong> uses COP{" "}
            {CO_UVT.toLocaleString()} for 2026 and the resident Article 241 tax
            table.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Contributions</strong>{" "}
            include health, pension, and pension solidarity contributions capped
            at 25 monthly minimum salaries.
          </li>
          <li>
            <strong className="text-zinc-300">Dependents</strong> use the
            Article 387 payroll deduction plus the Article 336 deduction of COP{" "}
            {CO_ARTICLE_336_DEPENDENT_DEDUCTION.toLocaleString()} per dependent
            for up to {CO_ARTICLE_336_DEPENDENT_MAX}.
          </li>
          <li>
            <strong className="text-zinc-300">Health and Housing</strong> model
            prepaid health up to COP {CO_PREPAID_HEALTH_LIMIT.toLocaleString()}{" "}
            and housing interest up to COP{" "}
            {CO_MORTGAGE_INTEREST_LIMIT.toLocaleString()} before shared cap
            limits.
          </li>
          <li>
            <strong className="text-zinc-300">Electronic Invoices</strong> are
            modeled as the Article 336 1% deduction, capped at COP{" "}
            {CO_ELECTRONIC_INVOICE_DEDUCTION_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
