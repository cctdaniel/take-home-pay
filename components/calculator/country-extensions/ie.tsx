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
import type { IECalculatorInputs, IETaxStatus } from "@/lib/countries/ie/types";

export default function IECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<IECalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const pensionContributionLimit = contributionLimits.pensionContribution.limit;

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
            id="ie-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="ie-tax-status"
            label="Tax status"
            value={inputs.taxStatus}
            onChange={(taxStatus) =>
              setInputs((current) => ({
                ...current,
                taxStatus: taxStatus as IETaxStatus,
              }))
            }
            options={[
              { value: "single", label: "Single employee" },
              {
                value: "married_one_income",
                label: "Married/civil partners, one income",
              },
              {
                value: "married_two_incomes",
                label: "Married/civil partners, two incomes",
              },
            ]}
            description="Selects Ireland's modeled standard-rate band and personal/PAYE tax credits."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Pension contribution"
          value={inputs.contributions.pensionContribution}
          onChange={(pensionContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                pensionContribution: Math.min(
                  pensionContribution,
                  pensionContributionLimit,
                ),
              },
            }))
          }
          max={pensionContributionLimit}
          step={100}
          currency={currency}
          description="Optional pension contribution modeled with income-tax relief up to the simplified annual cap proxy."
        />
      }
      contributionsTitle="Retirement & Deduction Inputs"
      contributionsDescription="Optional Irish pension contribution modeled by the calculator"
      seoInfo={<IrelandTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in
            Ireland, including PAYE income tax, selectable single/married bands,
            employee PRSI, Universal Social Charge, standard credits, and
            optional pension relief.
          </p>
          <p className="mt-2">
            Ireland has local equivalents rather than US-style controls:
            civil-partner/married bands replace US filing status, and pension
            contributions are modeled for income-tax relief. Age USC rules,
            detailed pension age bands, benefit-in-kind, bonus, and
            employer-only rules are documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function IrelandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ireland</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">PAYE Income Tax</strong> – the
            selected Irish tax status controls the standard-rate band and
            credits before income above the band is taxed at 40%.
          </li>
          <li>
            <strong className="text-zinc-300">Tax Credits</strong> – the
            standard personal and employee PAYE credits are applied against
            income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Pension Relief</strong> – optional
            pension contributions reduce the modeled PAYE taxable base up to the
            simplified annual cap proxy.
          </li>
          <li>
            <strong className="text-zinc-300">PRSI and USC</strong> – employee
            PRSI and Universal Social Charge are added as payroll deductions
            separate from PAYE income tax; USC is zero when annual income is
            within the exemption limit.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net salary
            equals gross salary minus PAYE after credits, PRSI, USC, and pension
            cash contributions.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          The model excludes age or medical-card USC rules, detailed pension
          age-band caps, benefit-in-kind detail, and week-one payroll timing.
        </p>
      </div>
    </section>
  );
}
