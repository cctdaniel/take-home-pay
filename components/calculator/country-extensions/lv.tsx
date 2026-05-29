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
import type { LVCalculatorInputs } from "@/lib/countries/lv/types";
import { clampAmount } from "@/lib/utils";

export default function LVCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<LVCalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).privatePension
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
            id="lv-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Private pension fund"
          description="Payments reduce taxable income up to EUR 4,000 and 10% of gross per year."
          value={inputs.contributions.privatePension}
          onChange={(privatePension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                privatePension: clampAmount(privatePension, limit),
              },
            }))
          }
          max={limit}
          step={100}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          10.5% social capped; EUR 550/month NTA; private pension deduction; PIT
          25.5%/33%.
        </InfoPanel>
      }
      seoInfo={<LatviaTaxInfo />}
    />
  );
}

function LatviaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Latvia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – 10.5%
            employee (capped).
          </li>
          <li>
            <strong className="text-zinc-300">Private pension</strong> – deductible
            up to EUR 4,000 and 10% of gross.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 25.5% / 33%
            after NTA.
          </li>
        </ul>
      </div>
    </section>
  );
}
