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
import type { FRCalculatorInputs } from "@/lib/countries/fr/types";

export default function FRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<FRCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const retirementSavingsLimit = contributionLimits.retirementSavings.limit;

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
            id="fr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="fr-household-parts"
            label="Tax household"
            value={inputs.taxHouseholdParts.toString()}
            onChange={(value) =>
              setInputs((current) => ({
                ...current,
                taxHouseholdParts: Number(value),
              }))
            }
            options={[
              { value: "1", label: "Single / 1 part" },
              { value: "1.5", label: "Single + 1 child / 1.5 parts" },
              { value: "2", label: "Married/PACS or single + 2 children / 2 parts" },
              { value: "2.5", label: "Married/PACS + 1 child / 2.5 parts" },
              { value: "3", label: "Married/PACS + 2 children / 3 parts" },
              { value: "4", label: "Married/PACS + 3 children / 4 parts" },
            ]}
            description="Simplified family quotient parts; detailed quotient benefit caps are outside this model."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="PER retirement savings"
          value={inputs.contributions.retirementSavings}
          onChange={(retirementSavings) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                retirementSavings: Math.min(retirementSavings, retirementSavingsLimit),
              },
            }))
          }
          max={retirementSavingsLimit}
          step={100}
          currency={currency}
          description="Optional PER-style retirement savings deductible from taxable income up to the modeled annual cap."
        />
      }
      contributionsTitle="Retirement & Deduction Inputs"
      contributionsDescription="Optional French tax-reducing contributions modeled by the calculator"
      seoInfo={<FranceTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in France,
            including French income tax with simplified family quotient parts, employee social contributions, PER retirement savings, and the 10% employment expense deduction.
          </p>
          <p className="mt-2">
            France has local equivalents rather than US-style controls: tax
            household parts replace filing status, and PER retirement savings
            is the modeled pre-tax retirement input. Detailed quotient caps,
            special expatriate, benefit-in-kind, bonus, and employer-only rules
            are documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function FranceTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">France</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Income Tax</strong> – taxable salary is calculated after the modeled 10% employment expense deduction and optional PER retirement savings, then taxed with France&apos;s progressive bands from 0% to 45% using the selected family quotient parts.</li>
          <li><strong className="text-zinc-300">Employee Contributions</strong> – mandatory employee social contributions are modeled as a combined payroll deduction because exact rates vary by tranche, scheme, and employment status.</li>
          <li><strong className="text-zinc-300">Tax Household</strong> – France uses family quotient parts rather than US filing statuses; this calculator exposes common single, married/PACS, and child part combinations with detailed quotient caps excluded.</li>
          <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus modeled employee social contributions, PER cash contributions, and progressive income tax after deductions.</li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">The model excludes personalized withholding rates, detailed pension tranche rates, quotient-benefit caps, non-retirement credits, social surcharge detail, benefits in kind, and employer-only charges.</p>
      </div>
    </section>
  );
}
