"use client";

import {
  BooleanSelectField,
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
  IS_FOREIGN_EXPERT_RELIEF_RATE,
  IS_FOREIGN_EXPERT_RELIEF_YEARS,
  IS_PRIVATE_PENSION_DEDUCTION_RATE,
  IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
  IS_PUBLIC_BENEFIT_DONATION_MINIMUM,
} from "@/lib/countries/is/constants/tax-year-2026";
import type { ISCalculatorInputs } from "@/lib/countries/is/types";

export default function ISCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ISCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const privatePensionLimit =
    contributionLimits.privatePensionContribution?.limit ?? 0;
  const donationLimit = contributionLimits.charitableDonations?.limit ?? 0;

  const setContribution = (
    key: keyof ISCalculatorInputs["contributions"],
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? 0;

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
          <BooleanSelectField
            id="is-foreign-expert-relief"
            label="Foreign Expert Relief"
            value={inputs.foreignExpertRelief === true}
            onChange={(foreignExpertRelief) =>
              setInputs((current) => ({ ...current, foreignExpertRelief }))
            }
            trueLabel="Approved"
            falseLabel="Not approved"
            description={`${(
              IS_FOREIGN_EXPERT_RELIEF_RATE * 100
            ).toFixed(0)}% taxable-income reduction for approved first-${IS_FOREIGN_EXPERT_RELIEF_YEARS}-year foreign experts`}
          />
          <PayFrequencyField
            id="is-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label={
              contributionLimits.privatePensionContribution?.name ??
              "Private supplementary pension contribution"
            }
            value={Math.min(
              inputs.contributions.privatePensionContribution,
              privatePensionLimit,
            )}
            onChange={(amount) =>
              setContribution("privatePensionContribution", amount)
            }
            max={privatePensionLimit}
            step={Math.max(1_000, Math.round(privatePensionLimit / 100))}
            currency={currency}
            description={
              contributionLimits.privatePensionContribution?.description ??
              "Deductible employee supplementary pension saving."
            }
          />
          <ContributionSlider
            label={
              contributionLimits.charitableDonations?.name ??
              "Registered public-benefit donations"
            }
            value={Math.min(
              inputs.contributions.charitableDonations,
              donationLimit,
            )}
            onChange={(amount) =>
              setContribution("charitableDonations", amount)
            }
            max={donationLimit}
            step={1_000}
            currency={currency}
            description={
              contributionLimits.charitableDonations?.description ??
              "Registered public-benefit gifts that reduce the annual tax base."
            }
          />
        </div>
      }
      contributionsTitle="Pension Savings And Return Deductions"
      contributionsDescription="Capped Iceland deductions that reduce taxable salary or annual income-tax base"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Iceland employment salary for a full tax year
            using the 2026 withholding brackets, personal tax credit, mandatory
            4% employee pension contribution, and selected private
            supplementary pension saving.
          </p>
          <p className="mt-2">
            The optional private pension slider is capped at{" "}
            {(IS_PRIVATE_PENSION_DEDUCTION_RATE * 100).toFixed(0)}% of salary
            because the mandatory 4% employee pension plus private pension
            deductions are modeled within the published pension deduction cap.
            Registered public-benefit donations are modeled separately with a
            minimum annual gift of ISK{" "}
            {IS_PUBLIC_BENEFIT_DONATION_MINIMUM.toLocaleString()} and a maximum
            deduction of ISK{" "}
            {IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT.toLocaleString()}.
          </p>
          <p className="mt-2">
            Approved foreign expert relief taxes 75% of employment income for
            the first three years; pension contribution bases remain calculated
            on total income. Union dues, municipality-specific rates beyond the
            published withholding brackets, transferable spouse credits, child
            benefits, housing interest subsidies, capital income, treaty
            positions, and self-employment rules depend on facts outside a
            single-employee salary calculator.
          </p>
        </InfoPanel>
      }
      seoInfo={<IcelandTaxInfo />}
    />
  );
}

function IcelandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Iceland Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            annualized 2026 Iceland withholding brackets and personal tax credit.
          </li>
          <li>
            <strong className="text-zinc-300">Mandatory Pension</strong> is
            modeled as a 4% employee pension deduction from pay and taxable
            salary.
          </li>
          <li>
            <strong className="text-zinc-300">Private Pension Savings</strong>{" "}
            can be entered up to 4% of salary and is deducted from pay and
            taxable salary.
          </li>
          <li>
            <strong className="text-zinc-300">Public-Benefit Donations</strong>{" "}
            reduce the annual income-tax base once registered gifts reach ISK{" "}
            {IS_PUBLIC_BENEFIT_DONATION_MINIMUM.toLocaleString()}, up to ISK{" "}
            {IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Foreign Expert Relief</strong>{" "}
            applies a 25% taxable-income reduction when the approved
            first-three-year regime is selected.
          </li>
        </ul>
      </div>
    </section>
  );
}
