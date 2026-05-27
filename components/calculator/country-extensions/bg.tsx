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
import {
  BG_CHILD_RELIEF_ONE_CHILD_EUR,
  BG_CHILD_RELIEF_THREE_PLUS_CHILDREN_EUR,
  BG_CHILD_RELIEF_TWO_CHILDREN_EUR,
  BG_DONATION_RELIEF_RATES,
  BG_DISABLED_CHILD_RELIEF_EUR,
  BG_INCOME_TAX_RATE,
  BG_REDUCED_WORKING_CAPACITY_RELIEF_EUR,
  BG_SOCIAL_HEALTH_RATE,
} from "@/lib/countries/bg/constants/tax-year-2026";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  BGCalculatorInputs,
  BGContributionInputs,
  BGDonationReliefCategory,
} from "@/lib/countries/bg/types";

const DONATION_CATEGORY_OPTIONS = [
  { value: "general_5", label: "General approved donations (5%)" },
  { value: "culture_15", label: "Culture donations (15%)" },
  { value: "medical_50", label: "Medical / assisted reproduction funds (50%)" },
] satisfies Array<{ value: BGDonationReliefCategory; label: string }>;

const CONTRIBUTION_KEYS = [
  "retirementContribution",
  "insurancePremiums",
  "charitableDonations",
] satisfies Array<keyof BGContributionInputs>;

export default function BGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BGCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (key: keyof BGContributionInputs, amount: number) => {
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
            id="bg-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberStepperField
            id="bg-children"
            label="Eligible Children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfChildren,
                numberOfDisabledChildren: Math.min(
                  current.numberOfDisabledChildren,
                  numberOfChildren,
                ),
              }))
            }
            min={0}
            max={10}
            description="NRA child relief is modeled with fixed EUR conversion from the published BGN relief amounts."
          />
          <NumberStepperField
            id="bg-disabled-children"
            label="Children With Disabilities"
            value={Math.min(
              inputs.numberOfDisabledChildren,
              inputs.numberOfChildren,
            )}
            onChange={(numberOfDisabledChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfDisabledChildren: Math.min(
                  numberOfDisabledChildren,
                  current.numberOfChildren,
                ),
              }))
            }
            min={0}
            max={inputs.numberOfChildren}
            description="Disabled-child relief is capped by the number of eligible children entered."
          />
          <BooleanSelectField
            id="bg-reduced-working-capacity"
            label="50%+ Reduced Working Capacity"
            value={inputs.hasReducedWorkingCapacity}
            onChange={(hasReducedWorkingCapacity) =>
              setInputs((current) => ({
                ...current,
                hasReducedWorkingCapacity,
              }))
            }
            trueLabel="Apply relief"
            falseLabel="No personal disability relief"
            description="NRA relief for people with 50% or more reduced working capacity."
          />
          <SelectField
            id="bg-donation-relief-category"
            label="Donation Relief Category"
            value={inputs.donationReliefCategory}
            onChange={(donationReliefCategory) =>
              setInputs((current) => {
                const nextInputs = {
                  ...current,
                  donationReliefCategory,
                };
                const nextDonationLimit =
                  getCountryCalculator(country).getContributionLimits(
                    nextInputs,
                  ).charitableDonations?.limit ?? 0;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    charitableDonations: Math.min(
                      current.contributions.charitableDonations ?? 0,
                      nextDonationLimit,
                    ),
                  },
                };
              })
            }
            options={DONATION_CATEGORY_OPTIONS}
            description="Sets the Article 22 cap applied to the approved-donations slider."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Bulgaria Resident Relief Inputs"
      contributionsDescription="Modeled Article 19 and Article 22 deductions that reduce resident employment taxable income"
      contributions={
        <div className="space-y-6">
          {CONTRIBUTION_KEYS.map((key) => {
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
                step={key === "charitableDonations" ? 50 : 100}
                currency={currency}
                description={limit.description}
              />
            );
          })}
        </div>
      }
      seoInfo={<BulgariaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Bulgaria resident employment salary in euros, with flat
            personal income tax, employee social and health insurance, and
            annual child, disabled-child, and personal reduced-working-capacity
            reliefs converted from the NRA BGN amounts. The optional sliders
            model Article 19 voluntary social or commercial insurance reliefs
            and Article 22 approved-donation relief.
          </p>
          <p className="mt-2">
            Exact social insurance category splits, employer contributions, and
            annual-return documentation checks are not included.
          </p>
        </InfoPanel>
      }
    />
  );
}

function BulgariaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Bulgaria Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> is modeled at{" "}
            {(BG_INCOME_TAX_RATE * 100).toFixed(0)}% after employee social
            insurance and selected child or personal disability reliefs.
          </li>
          <li>
            <strong className="text-zinc-300">Social Insurance</strong> uses
            the general employee social and health rate of{" "}
            {(BG_SOCIAL_HEALTH_RATE * 100).toFixed(2)}% up to the modeled
            contribution ceiling.
          </li>
          <li>
            <strong className="text-zinc-300">Child Reliefs</strong> reduce the
            tax base by about EUR{" "}
            {Math.round(BG_CHILD_RELIEF_ONE_CHILD_EUR).toLocaleString()} for
            one child, EUR{" "}
            {Math.round(BG_CHILD_RELIEF_TWO_CHILDREN_EUR).toLocaleString()} for
            two, EUR{" "}
            {Math.round(BG_CHILD_RELIEF_THREE_PLUS_CHILDREN_EUR).toLocaleString()}{" "}
            for three or more, plus about EUR{" "}
            {Math.round(BG_DISABLED_CHILD_RELIEF_EUR).toLocaleString()} per
            disabled child.
          </li>
          <li>
            <strong className="text-zinc-300">Personal Disability Relief</strong>{" "}
            reduces the tax base by about EUR{" "}
            {Math.round(
              BG_REDUCED_WORKING_CAPACITY_RELIEF_EUR,
            ).toLocaleString()}{" "}
            for people with 50% or more reduced working capacity.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary Insurance</strong>{" "}
            exposes Article 19 relief for voluntary pension/social insurance and
            voluntary health/life insurance, each modeled up to 10% of the
            employment taxable base proxy.
          </li>
          <li>
            <strong className="text-zinc-300">Donation Relief</strong> uses the
            selected Article 22 cap of{" "}
            {(BG_DONATION_RELIEF_RATES.general_5 * 100).toFixed(0)}%,{" "}
            {(BG_DONATION_RELIEF_RATES.culture_15 * 100).toFixed(0)}%, or{" "}
            {(BG_DONATION_RELIEF_RATES.medical_50 * 100).toFixed(0)}% depending
            on the donation category.
          </li>
        </ul>
      </div>
    </section>
  );
}
