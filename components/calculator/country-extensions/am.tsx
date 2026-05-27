"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
  type SelectOption,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  AMCalculatorInputs,
  AMContributionInputs,
  AMHealthInsuranceStatus,
  AMPensionParticipation,
} from "@/lib/countries/am/types";

const PENSION_OPTIONS: SelectOption<AMPensionParticipation>[] = [
  { value: "funded_pension", label: "Funded pension participant" },
  { value: "not_participating", label: "Not participating" },
];

const HEALTH_OPTIONS: SelectOption<AMHealthInsuranceStatus>[] = [
  { value: "applies", label: "Health insurance applies" },
  { value: "not_applicable", label: "No health charge" },
];

const REFUND_KEYS = [
  "housingExpenses",
  "tertiaryEducationExpenses",
  "medicalExpenses",
  "educationExpenses",
] satisfies Array<keyof AMContributionInputs>;

export default function ArmeniaCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<AMCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (key: keyof AMContributionInputs, amount: number) => {
    const limit = contributionLimits[key]?.limit ?? Number.POSITIVE_INFINITY;
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.min(Math.max(0, amount), limit),
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
            id="am-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="am-pension-participation"
            label="Funded Pension"
            value={inputs.pensionParticipation}
            onChange={(pensionParticipation) =>
              setInputs((current) => ({
                ...current,
                pensionParticipation,
              }))
            }
            options={PENSION_OPTIONS}
            description="Applies the statutory employee social contribution formula for funded pension participants."
          />
          <SelectField
            id="am-health-insurance"
            label="Health Insurance"
            value={inputs.healthInsuranceStatus}
            onChange={(healthInsuranceStatus) =>
              setInputs((current) => ({
                ...current,
                healthInsuranceStatus,
              }))
            }
            options={HEALTH_OPTIONS}
            description="Models the 2026 mandatory medical insurance salary deduction when it applies."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Armenia Income-Tax Refund Inputs"
      contributionsDescription="Modeled employee income-tax refunds for eligible mortgage interest, specialized tuition, and SRC social expenses"
      contributions={
        <div className="space-y-6">
          {REFUND_KEYS.map((key) => {
            const limit = contributionLimits[key];

            if (!limit) {
              return null;
            }

            return (
              <ContributionSlider
                key={key}
                label={limit.name}
                value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                onChange={(amount) => setContribution(key, amount)}
                max={limit.limit}
                step={key === "housingExpenses" ? 50_000 : 10_000}
                currency={currency}
                description={limit.description}
              />
            );
          })}
        </div>
      }
      infoCard={
        <InfoPanel title="Armenia Payroll Scope">
          <p>
            This models ordinary employment salary with 20% income tax, stamp
            duty, and the employee-funded pension and medical insurance charges
            selected above. Funded pension participation is mandatory for many
            employees born in 1974 or later and can also apply by election.
            Eligible mortgage interest, specialized higher-education tuition,
            and SRC healthcare or education social-expense refunds are modeled
            as income-tax refunds in the optional section.
          </p>
          <p className="mt-2">
            Mortgage refund eligibility depends on property type, developer,
            location, construction-permit timing, citizenship, and other Article
            160 restrictions; only enter amounts that satisfy those rules.
          </p>
        </InfoPanel>
      }
      seoInfo={<ArmeniaTaxInfo />}
    />
  );
}

function ArmeniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Armenia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - salary is
            taxed at the flat employment income tax rate.
          </li>
          <li>
            <strong className="text-zinc-300">Funded Pension</strong> - the
            selected participant option applies the monthly statutory social
            contribution formula and cap.
          </li>
          <li>
            <strong className="text-zinc-300">Health Insurance</strong> - the
            medical insurance toggle applies the 2026 fixed monthly salary
            charge where relevant.
          </li>
          <li>
            <strong className="text-zinc-300">Income-Tax Refunds</strong> -
            eligible mortgage interest, specialized masters/PhD tuition, and
            SRC social expenses are modeled as credits that can reduce income
            tax but do not reduce pension, health insurance, or stamp duty.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus income tax after modeled refunds,
            selected payroll charges, and stamp duty.
          </li>
        </ul>
      </div>
    </section>
  );
}
