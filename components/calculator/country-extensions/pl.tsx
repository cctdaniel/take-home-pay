"use client";

import {
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
  PL_CHILD_RELIEF_FIRST_OR_SECOND,
  PL_CHILD_RELIEF_FOURTH_PLUS,
  PL_CHILD_RELIEF_THIRD,
  PL_DONATION_DEDUCTION_LIMIT_RATE,
  PL_HEALTH_RATE,
  PL_IKZE_LIMIT,
  PL_INTERNET_RELIEF_LIMIT,
  PL_PIT_ZERO_RELIEF_LIMIT,
} from "@/lib/countries/pl/constants/tax-year-2026";
import type {
  PLCalculatorInputs,
  PLContributionInputs,
  PLPitZeroRelief,
  PLPpkRate,
} from "@/lib/countries/pl/types";
import { clampAmount } from "@/lib/utils";

const PPK_OPTIONS: Array<{ value: PLPpkRate; label: string }> = [
  { value: "0", label: "No PPK employee contribution" },
  { value: "2", label: "2% basic PPK" },
  { value: "3", label: "3% PPK" },
  { value: "4", label: "4% maximum employee PPK" },
];

const PIT_ZERO_OPTIONS: Array<{ value: PLPitZeroRelief; label: string }> = [
  { value: "none", label: "No PIT-0 relief" },
  { value: "youth_under_26", label: "Under 26 youth relief" },
  { value: "return_relief", label: "Return relief" },
  { value: "family_4plus", label: "Family 4+ relief" },
  { value: "working_senior", label: "Working senior relief" },
];

export default function PLCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<PLCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof PLContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof PLContributionInputs,
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
    key: keyof PLContributionInputs,
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
    renderContributionSlider("retirementContribution", 100),
    renderContributionSlider("charitableDonations", 100),
    renderContributionSlider("qualifyingExpenses", 10),
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
            id="pl-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="pl-pit-zero-relief"
            label="PIT-0 Relief"
            value={inputs.pitZeroRelief ?? "none"}
            onChange={(pitZeroRelief) =>
              setInputs((current) => ({ ...current, pitZeroRelief }))
            }
            options={PIT_ZERO_OPTIONS}
            description="PIT-0 salary reliefs share the PLN 85,528 annual exempt-revenue cap."
          />
          <NumberStepperField
            id="pl-children"
            label="Children For Tax Relief"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({ ...current, numberOfChildren }))
            }
            min={0}
            max={10}
            description="Standard child relief is modeled; single-child income test and refundable unused relief are excluded."
          />
          <SelectField
            id="pl-ppk-rate"
            label="PPK Employee Rate"
            value={inputs.ppkRate ?? "0"}
            onChange={(ppkRate) =>
              setInputs((current) => ({ ...current, ppkRate }))
            }
            options={PPK_OPTIONS}
            description="PPK is modeled as a post-tax payroll cash deduction, not an income-tax deduction."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        annualReturnDeductions.length > 0 ? (
          <div className="space-y-6">{annualReturnDeductions}</div>
        ) : undefined
      }
      contributionsTitle="Poland Annual Deductions"
      contributionsDescription="IKZE retirement saving plus PIT/O donation and internet deductions"
      seoInfo={<PolandTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Poland employment salary with the tax-free amount,
            standard employee revenue costs, PIT-0 relief where selected,
            employee ZUS and health contributions, child tax relief, optional
            PPK employee deduction, IKZE retirement contributions, PIT/O donation
            relief, and eligible internet relief.
          </p>
          <p className="mt-2">
            PIT-0 relief is shown as a tax-base effect because social
            contributions attributable to exempt revenue are not also deducted
            from taxable income.
          </p>
          <p className="mt-2">
            Joint filing, creative 50% costs, solidarity levy, PIT-2 monthly
            timing, PIT-0 eligibility-document checks, and refundable unused
            child relief are not included. Rehabilitation and
            thermomodernisation reliefs are property/health-specific annual
            reliefs and are not modeled as ordinary salary controls here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function PolandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Poland Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the PLN
            30,000 tax-free amount and 12%/32% tax scale with standard employee
            revenue costs.
          </li>
          <li>
            <strong className="text-zinc-300">Contributions</strong> include
            employee ZUS social insurance and health insurance at{" "}
            {(PL_HEALTH_RATE * 100).toFixed(0)}%, plus selected PPK if any.
          </li>
          <li>
            <strong className="text-zinc-300">PIT-0 Relief</strong> can model
            under-26, return, family 4+, or working-senior relief up to PLN{" "}
            {PL_PIT_ZERO_RELIEF_LIMIT.toLocaleString()} of exempt revenue.
          </li>
          <li>
            <strong className="text-zinc-300">Tax Reliefs</strong> include
            child relief of PLN{" "}
            {PL_CHILD_RELIEF_FIRST_OR_SECOND.toLocaleString()} for each of the
            first two children, PLN {PL_CHILD_RELIEF_THIRD.toLocaleString()} for
            the third, PLN {PL_CHILD_RELIEF_FOURTH_PLUS.toLocaleString()} for
            each next child, IKZE up to PLN {PL_IKZE_LIMIT.toLocaleString()},
            PIT/O donations up to{" "}
            {(PL_DONATION_DEDUCTION_LIMIT_RATE * 100).toFixed(0)}% of modeled
            salary income, and internet relief up to PLN{" "}
            {PL_INTERNET_RELIEF_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
