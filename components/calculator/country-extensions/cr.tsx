"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberStepperField,
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
import {
  CR_AGUINALDO_MONTHS,
  CR_CCSS_EMPLOYEE_RATE,
  CR_CHILD_TAX_CREDIT_ANNUAL,
  CR_SPOUSE_TAX_CREDIT_ANNUAL,
  CR_VOLUNTARY_PENSION_LIMIT_RATE,
} from "@/lib/countries/cr/constants/tax-year-2026";
import type {
  CRAguinaldoMode,
  CRCalculatorInputs,
} from "@/lib/countries/cr/types";
import { clampAmount } from "@/lib/utils";

const CR_AGUINALDO_OPTIONS: SelectOption<CRAguinaldoMode>[] = [
  {
    value: "includedInGross",
    label: "Gross includes aguinaldo",
  },
  {
    value: "additionalToGross",
    label: "Add aguinaldo on top",
  },
  {
    value: "none",
    label: "No aguinaldo",
  },
];

export default function CRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<CRCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const pensionLimit = contributionLimits.retirementContribution?.limit ?? 0;

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
            id="cr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="cr-aguinaldo-mode"
            label="Aguinaldo Treatment"
            value={inputs.aguinaldoMode}
            onChange={(aguinaldoMode) =>
              setInputs((current) => ({ ...current, aguinaldoMode }))
            }
            options={CR_AGUINALDO_OPTIONS}
            description="Models the legal one-twelfth Christmas bonus as exempt from CCSS and salary tax when selected."
          />
          <BooleanSelectField
            id="cr-spouse-credit"
            label="Spouse Tax Credit"
            value={inputs.hasEligibleSpouse}
            onChange={(hasEligibleSpouse) =>
              setInputs((current) => ({ ...current, hasEligibleSpouse }))
            }
            trueLabel="Claim spouse credit"
            falseLabel="No spouse credit"
            description={`Annualized 2026 credit: CRC ${CR_SPOUSE_TAX_CREDIT_ANNUAL.toLocaleString()}.`}
          />
          <NumberStepperField
            id="cr-child-credits"
            label="Eligible Children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({ ...current, numberOfChildren }))
            }
            min={0}
            max={10}
            description={`Annualized 2026 credit: CRC ${CR_CHILD_TAX_CREDIT_ANNUAL.toLocaleString()} per eligible child.`}
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
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  retirementContribution: clampAmount(amount, pensionLimit),
                },
              }))
            }
            max={pensionLimit}
            step={Math.max(10000, Math.round(pensionLimit / 100))}
            currency={currency}
            description={contributionLimits.retirementContribution.description}
          />
        ) : undefined
      }
      contributionsTitle="Costa Rica Voluntary Pension Deduction"
      contributionsDescription="Costa Rica voluntary complementary pension contribution modeled up to 10% of gross salary"
      seoInfo={<CostaRicaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Costa Rica salary tax using the 2026 Hacienda brackets,
            CCSS employee contribution, spouse and child tax credits, and
            voluntary complementary pension relief, with the legal aguinaldo
            separated when selected.
          </p>
          <p className="mt-2">
            The aguinaldo input models the legal one-twelfth amount. Excess
            bonuses, exact CCSS component splits, and non-salary income remain
            outside this salary-only model unless included in regular annual
            gross salary.
          </p>
        </InfoPanel>
      }
    />
  );
}

function CostaRicaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Costa Rica Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Salary Tax</strong> uses the
            2026 Hacienda monthly salary bands annualized over 12 months.
          </li>
          <li>
            <strong className="text-zinc-300">Aguinaldo</strong> can be
            included in gross, added on top, or excluded. The modeled legal
            amount equals {CR_AGUINALDO_MONTHS} month of regular pay for a full
            year and is excluded from CCSS and salary income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Family Credits</strong> subtract
            the annualized spouse credit of CRC{" "}
            {CR_SPOUSE_TAX_CREDIT_ANNUAL.toLocaleString()} and child credit of
            CRC {CR_CHILD_TAX_CREDIT_ANNUAL.toLocaleString()} per selected
            eligible child.
          </li>
          <li>
            <strong className="text-zinc-300">CCSS</strong> is modeled at{" "}
            {(CR_CCSS_EMPLOYEE_RATE * 100).toFixed(2)}% of the contribution
            base.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary Pension</strong> is
            modeled up to{" "}
            {(CR_VOLUNTARY_PENSION_LIMIT_RATE * 100).toFixed(0)}% of gross
            salary and reduces both the salary-tax and modeled CCSS bases.
          </li>
        </ul>
      </div>
    </section>
  );
}
