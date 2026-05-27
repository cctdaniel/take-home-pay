"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
import { JO_2026_SSC_MONTHLY_CAP } from "@/lib/countries/jo/constants/tax-year-2026";
import type { JOCalculatorInputs } from "@/lib/countries/jo/types";

export default function JordanCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<JOCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const monthlyCashSalary = Math.max(0, inputs.grossSalary) / 12;
  const monthlySscMax = Math.min(monthlyCashSalary, JO_2026_SSC_MONTHLY_CAP);

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
            id="jo-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="jo-resident-dependents"
            label="Resident Dependants"
            value={inputs.hasResidentDependents}
            onChange={(hasResidentDependents) =>
              setInputs((current) => ({
                ...current,
                hasResidentDependents,
                contributions: {
                  ...current.contributions,
                  qualifyingExpenses: Math.min(
                    current.contributions.qualifyingExpenses,
                    hasResidentDependents ? 3000 : 1000,
                  ),
                },
              }))
            }
            trueLabel="Yes"
            falseLabel="No"
            description="Adds the modeled JOD 9,000 resident-dependant exemption and raises the expense cap."
          />
          <CurrencyAmountField
            id="jo-ssc-monthly-wage"
            label="Monthly SSC Contribution Wage"
            value={Math.min(
              inputs.sscMonthlyWage || monthlySscMax,
              monthlySscMax,
            )}
            onChange={(sscMonthlyWage) =>
              setInputs((current) => ({
                ...current,
                sscMonthlyWage: Math.min(
                  Math.max(0, sscMonthlyWage),
                  monthlySscMax,
                ),
              }))
            }
            currency={currency}
            min={0}
            max={monthlySscMax}
            step={50}
            description={`Leave at 0 to use monthly gross salary capped at the 2026 SSC maximum wage of JOD ${JO_2026_SSC_MONTHLY_CAP.toLocaleString()}.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {(
            [
              "qualifyingExpenses",
              "housingExpenses",
              "charitableDonations",
            ] as const
          ).map((key) => {
            const limit = contributionLimits[key];

            if (!limit || limit.limit <= 0) {
              return null;
            }

            return (
              <ContributionSlider
                key={key}
                label={limit.name}
                value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                onChange={(amount) =>
                  setInputs((current) => ({
                    ...current,
                    contributions: {
                      ...current.contributions,
                      [key]: Math.min(amount, limit.limit),
                    },
                  }))
                }
                max={limit.limit}
                step={key === "qualifyingExpenses" ? 100 : 250}
                currency={currency}
                description={limit.description}
              />
            );
          })}
        </div>
      }
      contributionsTitle="Jordan Exemption and Deduction Inputs"
      contributionsDescription="Modeled personal expense exemptions and donation deductions that can reduce Jordan taxable income"
      seoInfo={<JordanTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary resident employment salary in Jordan using the
            individual PIT brackets, personal exemptions, national contribution
            tax where applicable, and employee Social Security deductions.
          </p>
          <p className="mt-2">
            The expense slider aggregates the legal medical, education, rent,
            housing-interest, and housing-murabaha cap. Special-zone rules,
            employer contributions, business income, and foreign tax credits
            are not treated as employee salary inputs here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function JordanTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Jordan
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - taxable
            salary is calculated after the modeled personal exemption,
            dependant exemption, and qualifying expense exemption.
          </li>
          <li>
            <strong className="text-zinc-300">National Contribution</strong> -
            a 1% tax is added only on annual taxable income above JOD 200,000.
          </li>
          <li>
            <strong className="text-zinc-300">Social Security</strong> - the
            employee contribution is modeled at 7.5% on the selected SSC
            contribution wage up to the 2026 monthly cap.
          </li>
        </ul>
      </div>
    </section>
  );
}
