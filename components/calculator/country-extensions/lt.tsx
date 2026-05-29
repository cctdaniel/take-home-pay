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
import type { LTCalculatorInputs } from "@/lib/countries/lt/types";
import { clampAmount } from "@/lib/utils";

export default function LTCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<LTCalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).pensionDeduction
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
            id="lt-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Pension / life insurance deduction"
          description="Qualifying III-pillar payments reduce GPM base up to EUR 1,500 and 25% of income after VSD."
          value={inputs.contributions.pensionDeduction}
          onChange={(pensionDeduction) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                pensionDeduction: clampAmount(pensionDeduction, limit),
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
          VSD 19.5% capped; progressive GPM; optional pension/life deduction for
          qualifying contracts.
        </InfoPanel>
      }
      seoInfo={<LithuaniaTaxInfo />}
    />
  );
}

function LithuaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Lithuania</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">VSD</strong> – 19.5% employee, capped.
          </li>
          <li>
            <strong className="text-zinc-300">Pension deduction</strong> – up to
            EUR 1,500 and 25% of income after VSD.
          </li>
          <li>
            <strong className="text-zinc-300">GPM</strong> – 20% / 25% / 32%
            progressive.
          </li>
        </ul>
      </div>
    </section>
  );
}
