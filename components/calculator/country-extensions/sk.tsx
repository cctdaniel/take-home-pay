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
import type { SKCalculatorInputs } from "@/lib/countries/sk/types";
import { clampAmount } from "@/lib/utils";

export default function SKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<SKCalculatorInputs>(country);
  const thirdPillarLimit =
    getCountryCalculator(country).getContributionLimits().thirdPillar?.limit ??
    0;

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
            id="sk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Third-pillar pension (DDS)"
          description="Reduces your income tax base up to EUR 180 per year."
          value={inputs.contributions.thirdPillar}
          onChange={(thirdPillar) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                thirdPillar: clampAmount(thirdPillar, thirdPillarLimit),
              },
            }))
          }
          max={thirdPillarLimit}
          step={10}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      seoInfo={<SlovakiaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Progressive PIT after social, health, NCZD, and optional third pillar
          reducing the tax base.
        </InfoPanel>
      }
    />
  );
}

function SlovakiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Slovakia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – 9.4%
            capped; <strong className="text-zinc-300">health</strong> – 5% on
            gross.
          </li>
          <li>
            <strong className="text-zinc-300">Third pillar</strong> – up to EUR
            180/year reduces the tax base.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            19% / 25% / 30% / 35%.
          </li>
        </ul>
      </div>
    </section>
  );
}
