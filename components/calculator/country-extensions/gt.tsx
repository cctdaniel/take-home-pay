"use client";

import {
  CalculatorFieldGrid,
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
  GT_DONATION_RATE_LIMIT,
  GT_IGSS_EMPLOYEE_RATE,
  GT_PERSONAL_DEDUCTION,
  GT_VAT_INVOICE_CREDIT_LIMIT,
  GT_VAT_INVOICE_CREDIT_RATE_LIMIT,
} from "@/lib/countries/gt/constants/tax-year-2026";
import type {
  GTCalculatorInputs,
  GTContributionInputs,
} from "@/lib/countries/gt/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function GTCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<GTCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof GTContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof GTContributionInputs,
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

  const invoiceCreditLimit = getLimit("qualifyingExpenses");
  const donationLimit = getLimit("charitableDonations");
  const insuranceLimit = getLimit("insurancePremiums");

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
            id="gt-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {invoiceCreditLimit > 0 ? (
            <ContributionSlider
              label={contributionLimits.qualifyingExpenses.name}
              value={Math.min(
                inputs.contributions.qualifyingExpenses ?? 0,
                invoiceCreditLimit,
              )}
              onChange={(amount) =>
                setContribution("qualifyingExpenses", amount)
              }
              max={invoiceCreditLimit}
              step={100}
              currency={currency}
              description={contributionLimits.qualifyingExpenses.description}
            />
          ) : null}
          {donationLimit > 0 ? (
            <ContributionSlider
              label={contributionLimits.charitableDonations.name}
              value={Math.min(
                inputs.contributions.charitableDonations ?? 0,
                donationLimit,
              )}
              onChange={(amount) =>
                setContribution("charitableDonations", amount)
              }
              max={donationLimit}
              step={Math.max(100, Math.round(donationLimit / 100))}
              currency={currency}
              description={contributionLimits.charitableDonations.description}
            />
          ) : null}
          {insuranceLimit > 0 ? (
            <ContributionSlider
              label={
                contributionLimits.insurancePremiums?.name ??
                "Life insurance premiums"
              }
              value={Math.min(
                inputs.contributions.insurancePremiums ?? 0,
                insuranceLimit,
              )}
              onChange={(amount) =>
                setContribution("insurancePremiums", amount)
              }
              max={insuranceLimit}
              step={Math.max(100, Math.round(insuranceLimit / 100))}
              currency={currency}
              description={contributionLimits.insurancePremiums?.description}
            />
          ) : null}
        </div>
      }
      contributionsTitle="Guatemala Annual Deductions"
      contributionsDescription="SAT employee deductions and credits claimed through the annual salaried-worker process"
      seoInfo={<GuatemalaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Guatemala employment income with the Q48,000 personal
            deduction, IGSS, VAT invoice credit, verified donations, and
            death-risk-only life insurance premiums.
          </p>
          <p className="mt-2">
            Donation solvency-document checks, payroll withholding timing, and
            minimum-wage transition mechanics are outside this annual salary
            model. No separate medical or alimony input is shown because the
            reviewed current salary-worker deduction list does not include one.
          </p>
        </InfoPanel>
      }
    />
  );
}

function GuatemalaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Guatemala Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Employment ISR</strong> uses the
            Q{GT_PERSONAL_DEDUCTION.toLocaleString()} annual personal deduction
            and the 5%/7% rentas del trabajo scale.
          </li>
          <li>
            <strong className="text-zinc-300">IGSS</strong> is modeled at{" "}
            {(GT_IGSS_EMPLOYEE_RATE * 100).toFixed(2)}% and reduces taxable
            employment income.
          </li>
          <li>
            <strong className="text-zinc-300">VAT Invoice Planilla</strong> is
            modeled as a direct ISR credit up to the lower of Q
            {GT_VAT_INVOICE_CREDIT_LIMIT.toLocaleString()} or{" "}
            {(GT_VAT_INVOICE_CREDIT_RATE_LIMIT * 100).toFixed(0)}% of gross
            salary.
          </li>
          <li>
            <strong className="text-zinc-300">Donations and Life Insurance</strong>{" "}
            model verified donations up to{" "}
            {(GT_DONATION_RATE_LIMIT * 100).toFixed(0)}% of gross income and
            death-risk-only life insurance premiums.
          </li>
        </ul>
      </div>
    </section>
  );
}
