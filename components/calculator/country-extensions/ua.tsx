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
import type { UACalculatorInputs } from "@/lib/countries/ua/types";
import { clampAmount } from "@/lib/utils";

export default function UACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<UACalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits().npfContribution
      ?.limit ?? 0;

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
            id="ua-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Non-state pension fund (NPF)"
          description="Own contributions up to UAH 4,660/month (annual cap) qualify for 18% tax discount."
          value={inputs.contributions.npfContribution}
          onChange={(npfContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                npfContribution: clampAmount(npfContribution, limit),
              },
            }))
          }
          max={limit}
          step={1_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax"
      infoCard={
        <InfoPanel title="Modeled scope">
          18% PIT + 5% military tax; NPF contributions reduce tax via 18% discount
          (claimed on annual return).
        </InfoPanel>
      }
      seoInfo={<UkraineTaxInfo />}
    />
  );
}

function UkraineTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ukraine</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">PIT</strong> – 18% on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Military tax</strong> – 5% on gross.
          </li>
          <li>
            <strong className="text-zinc-300">NPF</strong> – 18% tax discount on
            qualifying own contributions (annual cap).
          </li>
        </ul>
      </div>
    </section>
  );
}
