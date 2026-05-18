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
import type {
  ATCalculatorInputs,
  ATFamilyBonusChildren,
} from "@/lib/countries/at/types";

export default function ATCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ATCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const commuterAllowanceLimit = contributionLimits.commuterAllowance.limit;

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
            id="at-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="at-family-bonus-children"
            label="Family Bonus Plus children"
            value={inputs.familyBonusChildren.toString()}
            onChange={(value) =>
              setInputs((current) => ({
                ...current,
                familyBonusChildren: Number(value) as ATFamilyBonusChildren,
              }))
            }
            options={[
              { value: "0", label: "No modeled children" },
              { value: "1", label: "1 child" },
              { value: "2", label: "2 children" },
              { value: "3", label: "3 children" },
              { value: "4", label: "4 children" },
            ]}
            description="Simplified Family Bonus Plus credit for children under the modeled annual amount."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Commuter allowance"
          value={inputs.contributions.commuterAllowance}
          onChange={(commuterAllowance) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                commuterAllowance: Math.min(
                  commuterAllowance,
                  commuterAllowanceLimit,
                ),
              },
            }))
          }
          max={commuterAllowanceLimit}
          step={100}
          currency={currency}
          description="Optional commuter allowance deduction proxy; exact distance and public-transport eligibility are outside this model."
        />
      }
      contributionsTitle="Local Allowance Inputs"
      contributionsDescription="Optional Austrian wage-tax allowances modeled by the calculator"
      seoInfo={<AustriaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in
            Austria, including progressive wage tax, capped employee social
            insurance, optional commuter allowance, and Family Bonus Plus child
            credits.
          </p>
          <p className="mt-2">
            Austria has local equivalents rather than US-style controls: child
            relief is modeled through Family Bonus Plus and commuting is modeled
            as a wage-tax allowance. Exact 13th/14th salary treatment, commuter
            eligibility, church contributions, benefits in kind, and
            employer-only rules are documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function AustriaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Austria</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Wage Tax</strong> – annual salary
            after modeled employee social insurance and optional commuter
            allowance is taxed with Austria&apos;s progressive wage tax bands
            from 0% to 55%.
          </li>
          <li>
            <strong className="text-zinc-300">Social Insurance</strong> –
            employee social insurance is modeled at a general employee rate and
            capped at the annualized contribution-base ceiling.
          </li>
          <li>
            <strong className="text-zinc-300">Family Bonus Plus</strong> –
            selected children apply a simplified tax credit against wage tax,
            capped at the tax otherwise due.
          </li>
          <li>
            <strong className="text-zinc-300">No Regional Income Tax</strong> –
            Austria does not use US-style state income tax for salary employees
            in this model.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net salary
            equals gross salary minus capped employee social insurance and wage
            tax after commuter allowance and Family Bonus Plus credit.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          The model excludes 13th/14th salary preferential taxation, exact
          commuter eligibility, single-earner credits, church contributions,
          in-kind benefits, and detailed monthly payroll cap timing.
        </p>
      </div>
    </section>
  );
}
