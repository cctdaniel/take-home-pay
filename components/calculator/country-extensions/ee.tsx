"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
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
  EE_BASIC_EXEMPTION,
  EE_INCOME_TAX_RATE,
  EE_PENSIONABLE_AGE_BASIC_EXEMPTION,
  EE_THIRD_PILLAR_ABSOLUTE_LIMIT,
  EE_UNEMPLOYMENT_RATE,
} from "@/lib/countries/ee/constants/tax-year-2026";
import type {
  EECalculatorInputs,
  EEContributionInputs,
  EESecondPillarRate,
} from "@/lib/countries/ee/types";
import { formatCurrency } from "@/lib/format";

const SECOND_PILLAR_OPTIONS: Array<{
  value: EESecondPillarRate;
  label: string;
}> = [
  { value: "2", label: "2% default" },
  { value: "0", label: "0% suspended or not participating" },
  { value: "4", label: "4% increased" },
  { value: "6", label: "6% increased" },
];

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function EECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<EECalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const pensionLimit =
    contributionLimits.retirementContribution?.limit ?? 0;
  const pensionExemptionUsedElsewhere = Math.min(
    inputs.pensionBasicExemptionUsedElsewhere ?? 0,
    EE_PENSIONABLE_AGE_BASIC_EXEMPTION,
  );
  const salaryBasicExemption = inputs.isPensionableAge
    ? EE_PENSIONABLE_AGE_BASIC_EXEMPTION - pensionExemptionUsedElsewhere
    : EE_BASIC_EXEMPTION;

  const setContribution = (
    key: keyof EEContributionInputs,
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
            id="ee-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="ee-second-pillar-rate"
            label="Second Pillar Employee Rate"
            value={inputs.secondPillarRate}
            onChange={(secondPillarRate) =>
              setInputs((current) => ({ ...current, secondPillarRate }))
            }
            options={SECOND_PILLAR_OPTIONS}
            description="EMTA permits 2%, 4%, or 6%; use 0% if contributions are suspended or you are not participating."
          />
          <BooleanSelectField
            id="ee-pensionable-age"
            label="Pensionable-Age Basic Exemption"
            value={inputs.isPensionableAge}
            onChange={(isPensionableAge) =>
              setInputs((current) => ({
                ...current,
                isPensionableAge,
                pensionBasicExemptionUsedElsewhere: isPensionableAge
                  ? current.pensionBasicExemptionUsedElsewhere
                  : 0,
              }))
            }
            trueLabel="At pensionable age"
            falseLabel="General employee"
            description="Use this if you have reached pensionable age or will reach it during the 2026 calendar year."
          />
          {inputs.isPensionableAge && (
            <div className="md:col-span-2">
              <ContributionSlider
                label="Basic exemption used by pension"
                value={pensionExemptionUsedElsewhere}
                onChange={(amount) =>
                  setInputs((current) => ({
                    ...current,
                    pensionBasicExemptionUsedElsewhere: clampAmount(
                      amount,
                      EE_PENSIONABLE_AGE_BASIC_EXEMPTION,
                    ),
                  }))
                }
                max={EE_PENSIONABLE_AGE_BASIC_EXEMPTION}
                step={12}
                currency={currency}
                description={`EMTA's pensionable-age exemption is ${formatCurrency(EE_PENSIONABLE_AGE_BASIC_EXEMPTION, currency)} in 2026. This leaves ${formatCurrency(salaryBasicExemption, currency)} available against wages.`}
              />
            </div>
          )}
        </CalculatorFieldGrid>
      }
      contributions={
        pensionLimit > 0 ? (
          <ContributionSlider
            label={contributionLimits.retirementContribution.name}
            value={Math.min(
              inputs.contributions.retirementContribution ?? 0,
              pensionLimit,
            )}
            onChange={(amount) =>
              setContribution("retirementContribution", amount)
            }
            max={pensionLimit}
            step={50}
            currency={currency}
            description={contributionLimits.retirementContribution.description}
          />
        ) : undefined
      }
      contributionsTitle="Estonia Pension Tax Inputs"
      contributionsDescription="Second-pillar employee rate and deductible third-pillar pension savings"
      seoInfo={<EstoniaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Estonia resident employment salary with the flat income
            tax rate, annual basic exemption, employee unemployment insurance,
            selected second-pillar pension rate, and deductible third-pillar
            contributions.
          </p>
          <p className="mt-2">
            Pensionable-age basic exemption can be selected, with any portion
            already used by state pension or taxable second-pillar pension
            payments excluded from the salary allowance.
          </p>
          <p className="mt-2">
            Employer social tax and non-salary income are outside this
            salary-only model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function EstoniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Estonia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> is modeled at{" "}
            {(EE_INCOME_TAX_RATE * 100).toFixed(0)}% after the EUR{" "}
            {EE_BASIC_EXEMPTION.toLocaleString()} annual basic exemption, or
            the unused portion of the EUR{" "}
            {EE_PENSIONABLE_AGE_BASIC_EXEMPTION.toLocaleString()}
            pensionable-age exemption when selected.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Deductions</strong>{" "}
            include unemployment insurance at{" "}
            {(EE_UNEMPLOYMENT_RATE * 100).toFixed(1)}% and the selected
            second-pillar employee pension rate.
          </li>
          <li>
            <strong className="text-zinc-300">Third Pillar</strong>{" "}
            contributions are deductible up to 15% of salary and EUR{" "}
            {EE_THIRD_PILLAR_ABSOLUTE_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
