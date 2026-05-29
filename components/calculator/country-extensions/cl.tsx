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
import type { CLCalculatorInputs } from "@/lib/countries/cl/types";
import { clampAmount } from "@/lib/utils";

export default function CLCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<CLCalculatorInputs>(country);
  const apvLimit =
    getCountryCalculator(country).getContributionLimits().apvRegimeB?.limit ?? 0;

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
            id="cl-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="APV Régimen B"
          description="Voluntary pension savings deductible from income tax base up to 600 UF per year."
          value={inputs.contributions.apvRegimeB}
          onChange={(apvRegimeB) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                apvRegimeB: clampAmount(apvRegimeB, apvLimit),
              },
            }))
          }
          max={apvLimit}
          step={100_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          AFP, health, unemployment on gross; optional APV Régimen B reduces
          taxable income for impuesto único.
        </InfoPanel>
      }
      seoInfo={<ChileTaxInfo />}
    />
  );
}

function ChileTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Chile</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Mandatory</strong> – AFP 10%,
            health 7%, unemployment 0.6%.
          </li>
          <li>
            <strong className="text-zinc-300">APV Régimen B</strong> – up to 600
            UF/year reduces taxable income.
          </li>
        </ul>
      </div>
    </section>
  );
}
