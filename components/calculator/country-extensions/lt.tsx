"use client";

import {
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
  LT_ARTICLE_21_PENSION_LIFE_ABSOLUTE_CAP,
  LT_ARTICLE_21_TOTAL_EXPENSE_CAP_RATE,
  LT_COMPULSORY_HEALTH_INSURANCE_RATE,
  LT_DISABILITY_NPD_MONTHLY_0_25,
  LT_DISABILITY_NPD_MONTHLY_30_55,
  LT_NPD_ANNUAL_AMOUNT,
  LT_STATE_SOCIAL_INSURANCE_RATE,
} from "@/lib/countries/lt/constants/tax-year-2026";
import type {
  LTCalculatorInputs,
  LTContributionInputs,
  LTDisabilityNpdType,
  LTSecondPillarRate,
} from "@/lib/countries/lt/types";
import { clampAmount, clampCount } from "@/lib/utils";

const SECOND_PILLAR_OPTIONS: Array<{
  value: LTSecondPillarRate;
  label: string;
}> = [
  { value: "0", label: "Not participating / suspended" },
  { value: "3", label: "3% second pillar" },
];

const DISABILITY_NPD_OPTIONS: Array<{
  value: LTDisabilityNpdType;
  label: string;
}> = [
  { value: "none", label: "Ordinary NPD formula" },
  {
    value: "participation_0_25",
    label: "0-25% participation / severe disability",
  },
  {
    value: "participation_30_55",
    label: "30-55% participation / mild or moderate disability",
  },
];

export default function LTCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<LTCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (
    key: keyof LTContributionInputs,
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

  const renderSlider = (key: keyof LTContributionInputs, step: number) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key].name}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={step}
        currency={currency}
        description={contributionLimits[key].description}
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
            id="lt-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="lt-second-pillar-rate"
            label="Second Pillar Pension"
            value={inputs.secondPillarRate}
            onChange={(secondPillarRate) =>
              setInputs((current) => ({ ...current, secondPillarRate }))
            }
            options={SECOND_PILLAR_OPTIONS}
            description="Sodra's 2026 second-pillar rules allow a 3% personal contribution or suspension/non-participation."
          />
          <SelectField
            id="lt-disability-npd"
            label="Disability / Participation NPD"
            value={inputs.disabilityNpdType}
            onChange={(disabilityNpdType) =>
              setInputs((current) => ({ ...current, disabilityNpdType }))
            }
            options={DISABILITY_NPD_OPTIONS}
            description="Selects the fixed 2026 monthly NPD for disability or reduced participation; otherwise the ordinary formula is used."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {renderSlider("retirementContribution", 50)}
          {renderSlider("insurancePremiums", 50)}
          {renderSlider("educationExpenses", 50)}
        </div>
      }
      contributionsTitle="Lithuania Article 21 Deductions"
      contributionsDescription="Additional pension, grandfathered life/III-pillar, and formal study or training expenses"
      seoInfo={<LithuaniaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Lithuania resident employment salary with VMI PIT
            brackets, ordinary annual NPD, state social insurance, compulsory
            health insurance, and the selected second-pillar pension
            accumulation setting. Article 21 deductions are modeled as
            annual-return inputs where the worker controls the payment amount.
          </p>
          <p className="mt-2">
            Disability and reduced-participation NPD can be selected above.
            Family-member transfers of unused education relief, employer-paid
            benefit exemption tests, non-salary income aggregation, and treaty
            positions are not guessed in this salary page.
          </p>
        </InfoPanel>
      }
    />
  );
}

function LithuaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Lithuania Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            2026 employment PIT bands and the EUR{" "}
            {LT_NPD_ANNUAL_AMOUNT.toLocaleString()} ordinary annual NPD
            phase-out.
          </li>
          <li>
            <strong className="text-zinc-300">Disability NPD</strong> replaces
            the ordinary formula with fixed 2026 monthly amounts of EUR{" "}
            {LT_DISABILITY_NPD_MONTHLY_0_25.toLocaleString()} or EUR{" "}
            {LT_DISABILITY_NPD_MONTHLY_30_55.toLocaleString()} when selected.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Contributions</strong>{" "}
            include state social insurance at{" "}
            {(LT_STATE_SOCIAL_INSURANCE_RATE * 100).toFixed(2)}% and health
            insurance at{" "}
            {(LT_COMPULSORY_HEALTH_INSURANCE_RATE * 100).toFixed(2)}%.
          </li>
          <li>
            <strong className="text-zinc-300">Second Pillar</strong> adds the
            selected 3% personal pension accumulation contribution when enabled.
          </li>
          <li>
            <strong className="text-zinc-300">Article 21 Deductions</strong>{" "}
            include additional pension contributions, grandfathered life or
            III-pillar premiums, and qualifying formal study payments. The
            pension/life items share a EUR{" "}
            {LT_ARTICLE_21_PENSION_LIFE_ABSOLUTE_CAP.toLocaleString()} cap,
            and all Article 21 expenses are limited to{" "}
            {(LT_ARTICLE_21_TOTAL_EXPENSE_CAP_RATE * 100).toFixed(0)}% of
            modeled taxable income.
          </li>
        </ul>
      </div>
    </section>
  );
}
