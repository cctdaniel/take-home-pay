"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
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
  BZ_CHARITABLE_RELIEF_RATE,
  BZ_CHARITABLE_RELIEF_MINIMUM,
  BZ_EDUCATION_RELIEF_CHILD_LIMIT,
  BZ_EDUCATION_RELIEF_PER_CHILD,
  BZ_INCOME_TAX_RATE,
  BZ_LOW_INCOME_EXEMPTION_LIMIT,
  BZ_PERSONAL_RELIEF,
  BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_ANNUAL,
  BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY,
  BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY_EARNINGS_THRESHOLD,
  BZ_TAX_CREDIT_UPPER_LIMIT,
} from "@/lib/countries/bz/constants/tax-year-2026";
import type {
  BZCalculatorInputs,
  BZContributionInputs,
  BZSocialSecurityStatus,
} from "@/lib/countries/bz/types";
import { clampAmount } from "@/lib/utils";

const SOCIAL_SECURITY_OPTIONS: Array<{
  value: BZSocialSecurityStatus;
  label: string;
}> = [
  { value: "standard", label: "Standard insurable employee" },
  {
    value: "age60to64ReceivingBenefit",
    label: "Age 60-64 receiving SSB retirement benefit",
  },
  { value: "age65Plus", label: "Age 65 or older" },
];

function isEmployeeSsbDeducted(status: BZSocialSecurityStatus) {
  return status === "standard";
}

export default function BZCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BZCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const charitableRelief = contributionLimits.charitableDonations;
  const educationRelief = contributionLimits.educationExpenses;
  const weeklyGross = Math.max(0, inputs.grossSalary) / 52;
  const ssbEmployeeDeducted = isEmployeeSsbDeducted(
    inputs.socialSecurityStatus,
  );

  const setContribution = (
    key: keyof BZContributionInputs,
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? 0;
    const clampedAmount = clampAmount(amount, limit);

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]:
          key === "charitableDonations" &&
          clampedAmount > 0 &&
          clampedAmount < BZ_CHARITABLE_RELIEF_MINIMUM
            ? BZ_CHARITABLE_RELIEF_MINIMUM
            : clampedAmount,
      },
    }));
  };

  const reliefSliders = [
    charitableRelief && charitableRelief.limit > 0 ? (
      <ContributionSlider
        key="charitableDonations"
        label={charitableRelief.name}
        value={Math.min(
          inputs.contributions.charitableDonations ?? 0,
          charitableRelief.limit,
        )}
        onChange={(amount) => setContribution("charitableDonations", amount)}
        max={charitableRelief.limit}
        step={BZ_CHARITABLE_RELIEF_MINIMUM}
        currency={currency}
        description={charitableRelief.description}
      />
    ) : null,
    educationRelief && educationRelief.limit > 0 ? (
      <ContributionSlider
        key="educationExpenses"
        label={educationRelief.name}
        value={Math.min(
          inputs.contributions.educationExpenses ?? 0,
          educationRelief.limit,
        )}
        onChange={(amount) => setContribution("educationExpenses", amount)}
        max={educationRelief.limit}
        step={BZ_EDUCATION_RELIEF_PER_CHILD}
        currency={currency}
        description={educationRelief.description}
      />
    ) : null,
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
            id="bz-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="bz-social-security-status"
            label="Social Security Status"
            value={inputs.socialSecurityStatus}
            onChange={(socialSecurityStatus) =>
              setInputs((current) => ({
                ...current,
                socialSecurityStatus,
                ssbWeeklyInsurableEarnings: isEmployeeSsbDeducted(
                  socialSecurityStatus,
                )
                  ? current.ssbWeeklyInsurableEarnings
                  : 0,
              }))
            }
            options={SOCIAL_SECURITY_OPTIONS}
            description="SSB says age 60-64 retirement-benefit recipients and age 65+ employees have no employee deduction."
          />
          {ssbEmployeeDeducted ? (
            <CurrencyAmountField
              id="bz-ssb-weekly-insurable-earnings"
              label="Weekly SSB Insurable Earnings"
              value={Math.min(
                inputs.ssbWeeklyInsurableEarnings || weeklyGross,
                weeklyGross,
              )}
              onChange={(ssbWeeklyInsurableEarnings) =>
                setInputs((current) => ({
                  ...current,
                  ssbWeeklyInsurableEarnings: Math.min(
                    Math.max(0, ssbWeeklyInsurableEarnings),
                    weeklyGross,
                  ),
                }))
              }
              currency={currency}
              min={0}
              max={weeklyGross}
              step={10}
              description="Leave at 0 to use annual gross divided by 52; SSB bands are weekly and use actual insurable earnings."
            />
          ) : null}
          <NumberStepperField
            id="bz-education-relief-children"
            label="Eligible Education Relief Children"
            value={inputs.educationReliefChildren}
            onChange={(educationReliefChildren) =>
              setInputs((current) => {
                const nextChildren = Math.min(
                  Math.max(0, educationReliefChildren),
                  BZ_EDUCATION_RELIEF_CHILD_LIMIT,
                );
                const nextEducationLimit =
                  nextChildren * BZ_EDUCATION_RELIEF_PER_CHILD;

                return {
                  ...current,
                  educationReliefChildren: nextChildren,
                  contributions: {
                    ...current.contributions,
                    educationExpenses: Math.min(
                      current.contributions.educationExpenses ?? 0,
                      nextEducationLimit,
                    ),
                  },
                };
              })
            }
            min={0}
            max={BZ_EDUCATION_RELIEF_CHILD_LIMIT}
            description={`BTS allows BZD ${BZ_EDUCATION_RELIEF_PER_CHILD.toLocaleString()} per eligible child, up to ${BZ_EDUCATION_RELIEF_CHILD_LIMIT}; the child cannot be yours or live with you.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        reliefSliders.length > 0 ? (
          <div className="space-y-6">{reliefSliders}</div>
        ) : undefined
      }
      contributionsTitle="Annual Return Reliefs"
      contributionsDescription="Qualifying Belize charitable and education reliefs that reduce income tax but are not payroll deductions"
      seoInfo={<BelizeTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Belize employee income tax using the tax-year-2025 BTS
            personal relief amendments now used by the official calculator, plus
            the exact Social Security Board weekly employee contribution bands.
          </p>
          <p className="mt-2">
            Charitable relief and education relief are separate controls because
            BTS applies different minimum, one-sixth, per-child, and child-count
            rules. Voluntary SSB contributions are not shown because SSB
            describes them as payments for people no longer in insurable
            employment, not an ordinary salary payroll top-up.
          </p>
        </InfoPanel>
      }
    />
  );
}

function BelizeTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Belize Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Employee Income Tax</strong> uses
            the {(BZ_INCOME_TAX_RATE * 100).toFixed(0)}% BTS rate after the BZD{" "}
            {BZ_PERSONAL_RELIEF.toLocaleString()} relief for salaries above BZD{" "}
            {BZ_LOW_INCOME_EXEMPTION_LIMIT.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Low-Income Amendment</strong>{" "}
            exempts salaries at or below BZD{" "}
            {BZ_LOW_INCOME_EXEMPTION_LIMIT.toLocaleString()} and applies the
            BTS net salary floor credit through BZD{" "}
            {BZ_TAX_CREDIT_UPPER_LIMIT.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Social Security</strong> uses the
            official weekly SSB contribution bands, with the employee portion
            capped at BZD {BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY.toFixed(2)}{" "}
            per week on BZD{" "}
            {BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY_EARNINGS_THRESHOLD.toLocaleString()}
            +
            weekly earnings, or BZD{" "}
            {BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_ANNUAL.toLocaleString()} per year.
          </li>
          <li>
            <strong className="text-zinc-300">Charitable Relief</strong> is
            modeled when donations are at least BZD{" "}
            {BZ_CHARITABLE_RELIEF_MINIMUM.toLocaleString()}, up to one-sixth (
            {(BZ_CHARITABLE_RELIEF_RATE * 100).toFixed(2)}%) of chargeable
            income for qualifying cultural, religious, charitable, education, or
            town/village improvement donations.
          </li>
          <li>
            <strong className="text-zinc-300">Education Relief</strong> is
            capped at BZD {BZ_EDUCATION_RELIEF_PER_CHILD.toLocaleString()} per
            eligible child and BZD{" "}
            {(
              BZ_EDUCATION_RELIEF_PER_CHILD *
              BZ_EDUCATION_RELIEF_CHILD_LIMIT
            ).toLocaleString()}{" "}
            total for children who are not yours, do not live with you, and
            attend school full-time.
          </li>
        </ul>
      </div>
    </section>
  );
}
