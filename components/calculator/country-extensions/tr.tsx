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
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  TR_ANNUAL_MINIMUM_WAGE,
  TR_DISABILITY_ALLOWANCES,
  TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE,
  TR_GENERAL_DONATION_LIMIT_RATE,
  TR_INSURANCE_PREMIUM_RATE_LIMIT,
  TR_STAMP_TAX_RATE,
} from "@/lib/countries/tr/constants/tax-year-2026";
import type {
  TRCalculatorInputs,
  TRContributionInputs,
  TRDisabilityDegree,
  TRDonationReliefCategory,
} from "@/lib/countries/tr/types";
import { clampAmount } from "@/lib/utils";

const DISABILITY_OPTIONS: Array<{
  value: TRDisabilityDegree;
  label: string;
}> = [
  { value: "none", label: "No disability allowance" },
  { value: "first", label: "First degree" },
  { value: "second", label: "Second degree" },
  { value: "third", label: "Third degree" },
];

const DONATION_RELIEF_OPTIONS: Array<{
  value: TRDonationReliefCategory;
  label: string;
}> = [
  { value: "none", label: "No donation relief" },
  { value: "generalPublicBenefit", label: "General 5% relief" },
  { value: "fullEducationHealth", label: "Full education/health facility relief" },
];

export default function TRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<TRCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof TRContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof TRContributionInputs,
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

  const renderContributionSlider = (
    key: keyof TRContributionInputs,
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

  const annualReturnDeductions = [
    renderContributionSlider("insurancePremiums", 1000),
    renderContributionSlider("educationExpenses", 1000),
    renderContributionSlider(
      "charitableDonations",
      Math.max(1000, Math.round(getLimit("charitableDonations") / 100)),
    ),
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
            id="tr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="tr-disability-degree"
            label="Disability Allowance"
            value={inputs.disabilityDegree}
            onChange={(disabilityDegree) =>
              setInputs((current) => ({ ...current, disabilityDegree }))
            }
            options={DISABILITY_OPTIONS}
            description="GIB 2026 annual disability allowances are modeled by degree."
          />
          <SelectField
            id="tr-donation-relief-category"
            label="Donation Category"
            value={inputs.donationReliefCategory}
            onChange={(donationReliefCategory) =>
              setInputs((current) => {
                const nextInputs = { ...current, donationReliefCategory };
                const nextLimit =
                  getCountryCalculator(country).getContributionLimits(nextInputs)
                    .charitableDonations?.limit ?? 0;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    charitableDonations: clampAmount(
                      current.contributions.charitableDonations ?? 0,
                      nextLimit,
                    ),
                  },
                };
              })
            }
            options={DONATION_RELIEF_OPTIONS}
            description="GIB annual-return donation relief: 5% for general public-benefit donations or full relief for listed education/health facility donations."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        annualReturnDeductions.length > 0 ? (
          <div className="space-y-6">
            <CurrencyAmountField
              id="tr-union-dues"
              label={contributionLimits.qualifyingExpenses?.name ?? "Trade union dues"}
              value={inputs.contributions.qualifyingExpenses ?? 0}
              onChange={(amount) => setContribution("qualifyingExpenses", amount)}
              max={getLimit("qualifyingExpenses")}
              step={100}
              currency={currency}
              description={contributionLimits.qualifyingExpenses?.description}
            />
            {annualReturnDeductions}
          </div>
        ) : undefined
      }
      contributionsTitle="Turkey Salary Deductions"
      contributionsDescription="GIB wage and annual-return deductions for insurance premiums, union dues, education/health expenses, and donation relief"
      seoInfo={<TurkeyTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Turkey employment income with the 2026 wage tax
            brackets, SSI and unemployment insurance ceilings, minimum-wage
            income-tax and stamp-tax exemptions, disability allowance, and
            qualifying insurance premium, union-dues, education/health expense,
            and donation deductions.
          </p>
          <p className="mt-2">
            Month-by-month cumulative payroll timing, employer BES matching,
            development-priority-area donation-rate selection, sponsorship or
            investor relief, and remote-service business-income incentives are
            not included in this employee salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function TurkeyTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Turkey Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the 2026
            GIB wage-income brackets and the annualized minimum-wage tax
            exemption.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Deductions</strong>{" "}
            include employee SSI, unemployment insurance, and stamp tax at{" "}
            {(TR_STAMP_TAX_RATE * 100).toFixed(3)}% after the modeled
            minimum-wage exemption.
          </li>
          <li>
            <strong className="text-zinc-300">Allowances</strong> include the
            selected disability allowance up to TRY{" "}
            {TR_DISABILITY_ALLOWANCES.first.toLocaleString()} per year and
            insurance premiums capped at{" "}
            {(TR_INSURANCE_PREMIUM_RATE_LIMIT * 100).toFixed(0)}% of salary and
            TRY {TR_ANNUAL_MINIMUM_WAGE.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Annual Return Relief</strong>{" "}
            includes union dues, education/health expenses capped at{" "}
            {(TR_EDUCATION_HEALTH_EXPENSE_LIMIT_RATE * 100).toFixed(0)}% of the
            modeled declared wage income base, and donation relief at the
            selected{" "}
            {(TR_GENERAL_DONATION_LIMIT_RATE * 100).toFixed(0)}% or full-relief
            category.
          </li>
        </ul>
      </div>
    </section>
  );
}
