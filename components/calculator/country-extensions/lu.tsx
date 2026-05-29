"use client";

import {
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
import type { LUCalculatorInputs } from "@/lib/countries/lu/types";
import { clampAmount } from "@/lib/utils";

export default function LUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<LUCalculatorInputs>(country);
  const privatePensionLimit =
    getCountryCalculator(country).getContributionLimits().privatePension?.limit ??
    0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      hideDefaultSeoTaxInfo
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="lu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Private pension savings (Article 111bis)"
          description="Épargne-pension deductible from taxable income up to EUR 4,500 per year (2026)."
          value={inputs.contributions.privatePension}
          onChange={(privatePension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                privatePension: clampAmount(privatePension, privatePensionLimit),
              },
            }))
          }
          max={privatePensionLimit}
          step={100}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Capped employee social at 12.45% and progressive income tax on taxable
          salary after social and private pension deductions.
        </InfoPanel>
      }
      seoInfo={<LuxembourgTaxInfo />}
    />
  );
}

function LuxembourgTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Luxembourg
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – employee
            12.45% on gross up to EUR 140,364 annual base.
          </li>
          <li>
            <strong className="text-zinc-300">Private pension</strong> – Article
            111bis deduction up to EUR 4,500/year.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            0%–17% on remaining taxable salary.
          </li>
        </ul>
      </div>
    </section>
  );
}
