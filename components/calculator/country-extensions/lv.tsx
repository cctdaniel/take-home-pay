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
  LV_DEPENDENT_ALLOWANCE,
  LV_ELIGIBLE_EXPENSE_LIMIT,
  LV_NON_TAXABLE_MINIMUM,
  LV_PENSIONER_NON_TAXABLE_MINIMUM,
  LV_RETIREMENT_ABSOLUTE_LIMIT,
  LV_SOCIAL_INSURANCE_RATE,
} from "@/lib/countries/lv/constants/tax-year-2026";
import type {
  LVCalculatorInputs,
  LVContributionInputs,
} from "@/lib/countries/lv/types";
import { formatCurrency } from "@/lib/format";
import { clampAmount, clampCount } from "@/lib/utils";

export default function LVCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<LVCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const pensionerAllowanceUsedElsewhere = Math.min(
    inputs.pensionerAllowanceUsedElsewhere ?? 0,
    LV_PENSIONER_NON_TAXABLE_MINIMUM,
  );
  const salaryNonTaxableMinimum = inputs.isPensioner
    ? LV_PENSIONER_NON_TAXABLE_MINIMUM - pensionerAllowanceUsedElsewhere
    : LV_NON_TAXABLE_MINIMUM;

  const setContribution = (
    key: keyof LVContributionInputs,
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

  const renderSlider = (key: keyof LVContributionInputs, step: number) => {
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
            id="lv-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberStepperField
            id="lv-dependents"
            label="Tax Book Dependants"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({ ...current, numberOfDependents }))
            }
            min={0}
            max={10}
            description="VID dependant relief is EUR 250 per month, modeled as EUR 3,000 per year each."
          />
          <BooleanSelectField
            id="lv-pensioner-minimum"
            label="Pensioner Non-Taxable Minimum"
            value={inputs.isPensioner}
            onChange={(isPensioner) =>
              setInputs((current) => ({
                ...current,
                isPensioner,
                pensionerAllowanceUsedElsewhere: isPensioner
                  ? current.pensionerAllowanceUsedElsewhere
                  : 0,
              }))
            }
            trueLabel="Pensioner minimum"
            falseLabel="General employee minimum"
            description="Select when Latvia's pensioner non-taxable minimum applies; enter any amount already used by pension below."
          />
          {inputs.isPensioner && (
            <div className="md:col-span-2">
              <ContributionSlider
                label="Pensioner minimum used by pension"
                value={pensionerAllowanceUsedElsewhere}
                onChange={(amount) =>
                  setInputs((current) => ({
                    ...current,
                    pensionerAllowanceUsedElsewhere: clampAmount(
                      amount,
                      LV_PENSIONER_NON_TAXABLE_MINIMUM,
                    ),
                  }))
                }
                max={LV_PENSIONER_NON_TAXABLE_MINIMUM}
                step={100}
                currency={currency}
                description={`Latvia's 2026 pensioner minimum is ${formatCurrency(LV_PENSIONER_NON_TAXABLE_MINIMUM, currency)}. This leaves ${formatCurrency(salaryNonTaxableMinimum, currency)} available against salary.`}
              />
            </div>
          )}
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {renderSlider("retirementContribution", 50)}
          {renderSlider("qualifyingExpenses", 25)}
        </div>
      }
      contributionsTitle="Latvia Annual Reliefs"
      contributionsDescription="Private pension or life insurance plus eligible education, medical, and donation expenses"
      seoInfo={<LatviaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Latvia resident employment salary with the fixed
            general or pensioner non-taxable minimum, dependant allowance,
            employee social insurance, 2026 PIT rates, and annual-return
            eligible deductions.
          </p>
          <p className="mt-2">
            If the pensioner minimum is already applied to state pension by
            SSIA or another payer, enter that amount so salary does not receive
            the same allowance twice.
          </p>
          <p className="mt-2">
            Family-member expense carry-forwards, minimum social contribution
            rules, and solidarity-tax reconciliation are not modeled in this
            salary page.
          </p>
        </InfoPanel>
      }
    />
  );
}

function LatviaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Latvia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Allowances</strong> include the
            EUR {LV_NON_TAXABLE_MINIMUM.toLocaleString()} non-taxable minimum
            or the unused part of the EUR{" "}
            {LV_PENSIONER_NON_TAXABLE_MINIMUM.toLocaleString()} pensioner
            minimum, plus EUR {LV_DEPENDENT_ALLOWANCE.toLocaleString()} per
            dependant.
          </li>
          <li>
            <strong className="text-zinc-300">Social Insurance</strong> is
            modeled at {(LV_SOCIAL_INSURANCE_RATE * 100).toFixed(1)}% up to
            the annual contribution object.
          </li>
          <li>
            <strong className="text-zinc-300">Annual Reliefs</strong> include
            private pension or life insurance up to EUR{" "}
            {LV_RETIREMENT_ABSOLUTE_LIMIT.toLocaleString()} and eligible
            expenses up to EUR {LV_ELIGIBLE_EXPENSE_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
