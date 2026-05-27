"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberStepperField,
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
  AD_DISABLED_DEPENDENT_COEFFICIENT,
  AD_FAMILY_DEPENDENT_REDUCTION,
  AD_MORTGAGE_REDUCTION_LIMIT,
  AD_MORTGAGE_REDUCTION_RATE,
  AD_NON_WORKING_SPOUSE_PERSONAL_EXEMPT_AMOUNT,
} from "@/lib/countries/ad/constants/tax-year-2026";
import type { ADCalculatorInputs } from "@/lib/countries/ad/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function ADCountryExtension(props: CountryCalculatorExtensionProps) {
  const { country } = props;
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ADCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (
    key: "retirementContribution" | "housingExpenses",
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
            id="ad-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="ad-non-working-spouse"
            label="Non-Working Spouse/Partner"
            value={inputs.hasNonWorkingSpouseOrPartner}
            onChange={(hasNonWorkingSpouseOrPartner) =>
              setInputs((current) => ({
                ...current,
                hasNonWorkingSpouseOrPartner,
              }))
            }
            trueLabel="Yes"
            falseLabel="No"
            description={`Uses the modeled EUR ${AD_NON_WORKING_SPOUSE_PERSONAL_EXEMPT_AMOUNT.toLocaleString()} personal minimum when eligible.`}
          />
          <BooleanSelectField
            id="ad-disabled-taxpayer"
            label="Taxpayer Disability Relief"
            value={inputs.isDisabledTaxpayer}
            onChange={(isDisabledTaxpayer) =>
              setInputs((current) => ({ ...current, isDisabledTaxpayer }))
            }
            trueLabel="Eligible"
            falseLabel="Not eligible"
            description="Applies the modeled higher personal minimum for disability when the spouse/partner minimum is not selected."
          />
          <NumberStepperField
            id="ad-family-dependents"
            label="Family Dependents"
            value={inputs.numberOfFamilyDependents}
            onChange={(numberOfFamilyDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfFamilyDependents,
                numberOfDisabledDependents: Math.min(
                  current.numberOfDisabledDependents,
                  numberOfFamilyDependents,
                ),
              }))
            }
            min={0}
            max={10}
            description={`EUR ${AD_FAMILY_DEPENDENT_REDUCTION.toLocaleString()} reduction per eligible dependent.`}
          />
          <NumberStepperField
            id="ad-disabled-dependents"
            label="Disabled Dependents"
            value={Math.min(
              inputs.numberOfDisabledDependents,
              inputs.numberOfFamilyDependents,
            )}
            onChange={(numberOfDisabledDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfDisabledDependents: Math.min(
                  numberOfDisabledDependents,
                  current.numberOfFamilyDependents,
                ),
              }))
            }
            min={0}
            max={inputs.numberOfFamilyDependents}
            description={`Disabled dependent reduction uses a ${AD_DISABLED_DEPENDENT_COEFFICIENT}x coefficient.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {(["retirementContribution", "housingExpenses"] as const).map((key) => {
            const limit = contributionLimits[key];

            if (!limit || limit.limit <= 0) {
              return null;
            }

            return (
              <ContributionSlider
                key={key}
                label={limit.name}
                value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                onChange={(amount) => setContribution(key, amount)}
                max={limit.limit}
                step={key === "housingExpenses" ? 100 : 50}
                currency={currency}
                description={limit.description}
              />
            );
          })}
        </div>
      }
      contributionsTitle="Andorra IRPF Deduction Inputs"
      contributionsDescription="Qualifying IRPF pension-plan contributions and principal-residence mortgage expense relief"
      seoInfo={<AndorraTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Andorra resident employment income with
            employee CASS, the work-expense deduction, the selected personal
            exempt amount, family reductions, principal-residence mortgage
            relief, and qualifying pension-plan deduction.
          </p>
          <p className="mt-2">
            Cross-border worker elections, investment-income baskets,
            self-employment CASS bases, employer pension contributions, and
            eligibility-document checks are not modeled as salary inputs.
          </p>
        </InfoPanel>
      }
    />
  );
}

function AndorraTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Andorra Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income tax</strong> applies after
            employee CASS, the 3% employment expense deduction, the selected
            personal minimum, and modeled family reductions.
          </li>
          <li>
            <strong className="text-zinc-300">Employee CASS</strong> is modeled
            at 6.5% of gross salary and reduces the modeled IRPF base.
          </li>
          <li>
            <strong className="text-zinc-300">Mortgage relief</strong> is
            modeled as {AD_MORTGAGE_REDUCTION_RATE * 100}% of principal
            residence mortgage expenses, capped at EUR{" "}
            {AD_MORTGAGE_REDUCTION_LIMIT.toLocaleString()} of tax reduction.
          </li>
          <li>
            <strong className="text-zinc-300">Pension plans</strong> are
            deductible up to the lower of 30% of net work income or EUR 5,000.
          </li>
        </ul>
      </div>
    </section>
  );
}
