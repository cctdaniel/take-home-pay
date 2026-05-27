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
  HU_FAMILY_ALLOWANCE_ONE_DEPENDENT,
  HU_FAMILY_ALLOWANCE_THREE_PLUS_DEPENDENTS,
  HU_FAMILY_ALLOWANCE_TWO_DEPENDENTS,
  HU_FIRST_MARRIAGE_ALLOWANCE_ANNUAL,
  HU_INCOME_TAX_RATE,
  HU_PERSONAL_ALLOWANCE_ANNUAL_2026,
  HU_SOCIAL_SECURITY_RATE,
  HU_UNDER_25_ALLOWANCE_ANNUAL_2026,
  HU_VOLUNTARY_PENSION_CREDIT_CAP,
  HU_VOLUNTARY_PENSION_CREDIT_RATE,
} from "@/lib/countries/hu/constants/tax-year-2026";
import type {
  HUCalculatorInputs,
  HUContributionInputs,
  HUPitBaseAllowance,
} from "@/lib/countries/hu/types";
import { clampAmount, clampCount } from "@/lib/utils";

const PIT_BASE_ALLOWANCE_OPTIONS: Array<{
  value: HUPitBaseAllowance;
  label: string;
}> = [
  { value: "none", label: "No mother / youth allowance" },
  { value: "under_25", label: "Under 25 allowance" },
  { value: "mother_under_30", label: "Mother under 30 exemption" },
  { value: "mother_two_children", label: "Mother with 2 children" },
  { value: "mother_three_children", label: "Mother with 3 children" },
  { value: "mother_four_plus_children", label: "Mother with 4+ children" },
];

export default function HUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<HUCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const pensionLimit = contributionLimits.retirementContribution?.limit ?? 0;

  const setContribution = (
    key: keyof HUContributionInputs,
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
            id="hu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="hu-pit-base-allowance"
            label="PIT Base Allowance"
            value={inputs.pitBaseAllowance ?? "none"}
            onChange={(pitBaseAllowance) =>
              setInputs((current) => ({ ...current, pitBaseAllowance }))
            }
            options={PIT_BASE_ALLOWANCE_OPTIONS}
            description="NAV mother and under-25 allowances; select only when eligible."
          />
          <BooleanSelectField
            id="hu-personal-allowance"
            label="Personal Allowance"
            value={inputs.claimPersonalAllowance ?? false}
            onChange={(claimPersonalAllowance) =>
              setInputs((current) => ({ ...current, claimPersonalAllowance }))
            }
            trueLabel="Claim"
            falseLabel="Do not claim"
            description="Severe disability personal allowance based on the 2026 minimum wage."
          />
          <BooleanSelectField
            id="hu-first-marriage-allowance"
            label="First-Marriage Allowance"
            value={inputs.claimFirstMarriageAllowance ?? false}
            onChange={(claimFirstMarriageAllowance) =>
              setInputs((current) => ({
                ...current,
                claimFirstMarriageAllowance,
              }))
            }
            trueLabel="Claim"
            falseLabel="Do not claim"
            description="Joint HUF 33,335 monthly tax-base allowance for eligible first marriages."
          />
          <NumberStepperField
            id="hu-beneficiary-dependents"
            label="Beneficiary Dependents"
            value={inputs.beneficiaryDependents}
            onChange={(beneficiaryDependents) =>
              setInputs((current) => ({
                ...current,
                beneficiaryDependents,
                totalDependents: Math.max(
                  current.totalDependents,
                  beneficiaryDependents,
                ),
              }))
            }
            min={0}
            max={10}
            description="Children or other beneficiary dependents for the NAV family tax allowance."
          />
          <NumberStepperField
            id="hu-total-dependents"
            label="Total Dependents"
            value={Math.max(inputs.totalDependents, inputs.beneficiaryDependents)}
            onChange={(totalDependents) =>
              setInputs((current) => ({
                ...current,
                totalDependents: Math.max(
                  totalDependents,
                  current.beneficiaryDependents,
                ),
              }))
            }
            min={inputs.beneficiaryDependents}
            max={10}
            description="The per-child allowance depends on the total number of dependents in the family."
          />
          <BooleanSelectField
            id="hu-family-contribution-allowance"
            label="Family Contribution Allowance"
            value={inputs.claimFamilyContributionAllowance ?? true}
            onChange={(claimFamilyContributionAllowance) =>
              setInputs((current) => ({
                ...current,
                claimFamilyContributionAllowance,
              }))
            }
            trueLabel="Apply"
            falseLabel="Do not apply"
            description="Applies unused family tax allowance against employee social security when PIT is insufficient."
          />
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
            step={5000}
            currency={currency}
            description={contributionLimits.retirementContribution.description}
          />
        ) : undefined
      }
      contributionsTitle="Hungary Pension Tax Credit"
      contributionsDescription="Voluntary pension fund contributions and family allowance settings"
      seoInfo={<HungaryTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Hungary employment salary with the flat PIT rate,
            employee social security, NAV PIT base allowances, family tax
            allowance, and the voluntary pension fund tax credit.
          </p>
          <p className="mt-2">
            Eligibility-month proration, infant-care or child-care benefit
            income, detailed benefit taxation, and employer social contribution
            tax are separate timing, benefit, or employer-cost facts rather than
            employee-paid salary controls.
          </p>
        </InfoPanel>
      }
    />
  );
}

function HungaryTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Hungary Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> is modeled at{" "}
            {(HU_INCOME_TAX_RATE * 100).toFixed(0)}% after the selected family
            tax allowance.
          </li>
          <li>
            <strong className="text-zinc-300">NAV PIT base allowances</strong>{" "}
            include mother exemptions, under-25 allowance up to HUF{" "}
            {HU_UNDER_25_ALLOWANCE_ANNUAL_2026.toLocaleString()} per year,
            personal allowance up to HUF{" "}
            {HU_PERSONAL_ALLOWANCE_ANNUAL_2026.toLocaleString()}, and
            first-marriage allowance up to HUF{" "}
            {HU_FIRST_MARRIAGE_ALLOWANCE_ANNUAL.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Family Allowance</strong> uses
            monthly tax-base deductions of HUF{" "}
            {HU_FAMILY_ALLOWANCE_ONE_DEPENDENT.toLocaleString()}, HUF{" "}
            {HU_FAMILY_ALLOWANCE_TWO_DEPENDENTS.toLocaleString()}, or HUF{" "}
            {HU_FAMILY_ALLOWANCE_THREE_PLUS_DEPENDENTS.toLocaleString()} per
            beneficiary dependent based on total dependents. Any unused amount
            can be applied against employee social security when selected.
          </li>
          <li>
            <strong className="text-zinc-300">Contributions</strong> include
            employee social security at{" "}
            {(HU_SOCIAL_SECURITY_RATE * 100).toFixed(1)}% and a voluntary
            pension credit of{" "}
            {(HU_VOLUNTARY_PENSION_CREDIT_RATE * 100).toFixed(0)}% up to HUF{" "}
            {HU_VOLUNTARY_PENSION_CREDIT_CAP.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
