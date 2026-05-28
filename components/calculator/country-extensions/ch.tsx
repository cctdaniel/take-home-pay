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
import { CH_CANTONS } from "@/lib/countries/ch/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import { clampAmount } from "@/lib/utils";
import type {
  CHCalculatorInputs,
  CHFilingStatus,
} from "@/lib/countries/ch/types";
import type { SwitzerlandCantonCode } from "@/lib/countries/ch/constants/tax-year-2026";

export default function CHCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<CHCalculatorInputs>(country);
  const canton = CH_CANTONS.find((entry) => entry.code === inputs.canton);
  const pillar3aLimit =
    getCountryCalculator(country).getContributionLimits().pillar3a?.limit ?? 7_056;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      hideDefaultSeoTaxInfo
      taxOptions={
        <CalculatorFieldGrid columns={3}>
          <SelectField<SwitzerlandCantonCode>
            id="ch-canton"
            label="Canton"
            value={inputs.canton}
            onChange={(cantonCode) =>
              setInputs((current) => ({ ...current, canton: cantonCode }))
            }
            options={CH_CANTONS.map((entry) => ({
              value: entry.code,
              label: entry.name,
            }))}
            description="Canton multiplier on federal income tax."
          />
          <SelectField<CHFilingStatus>
            id="ch-filing-status"
            label="Filing Status"
            value={inputs.filingStatus}
            onChange={(filingStatus) =>
              setInputs((current) => ({ ...current, filingStatus }))
            }
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married (income splitting)" },
            ]}
          />
          <PayFrequencyField
            id="ch-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Pillar 3a contribution"
          description="Deductible third-pillar pension (Säule 3a) from federal/canton taxable income."
          value={inputs.contributions.pillar3a}
          onChange={(pillar3a) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                pillar3a: clampAmount(pillar3a, pillar3aLimit),
              },
            }))
          }
          max={pillar3aLimit}
          step={100}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your income tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Federal DBG 2025 brackets with {canton?.name ?? "selected canton"}{" "}
          multiplier ×{canton?.totalTaxMultiplier.toFixed(2)}. AHV/IV/EO and ALV
          employee contributions use the CHF 148,200 ceiling.
        </InfoPanel>
      }
      seoInfo={<SwitzerlandTaxInfo />}
    />
  );
}

function SwitzerlandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Switzerland</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Federal tax</strong> – DBG 2025
            progressive tariff on taxable salary; married filers use income
            splitting.
          </li>
          <li>
            <strong className="text-zinc-300">Canton tax</strong> – ZH, GE, ZG,
            VD, and BS use published multipliers on federal tax.
          </li>
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – AHV/IV/EO
            5.3% and ALV 1.1% (0.5% above ceiling) on earnings up to CHF 148,200.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net salary equals
            gross minus federal/canton income tax and employee social contributions.
          </li>
        </ul>
      </div>
    </section>
  );
}
