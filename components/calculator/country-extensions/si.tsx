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
import type { SICalculatorInputs } from "@/lib/countries/si/types";
import { clampAmount } from "@/lib/utils";

export default function SICountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<SICalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs)
      .supplementaryPension?.limit ?? 0;

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
            id="si-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Supplementary pension insurance"
          description="Premium reduces income tax base (max EUR 3,224.18, 5.844% of gross, or 24% of pension contributions)."
          value={inputs.contributions.supplementaryPension}
          onChange={(supplementaryPension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                supplementaryPension: clampAmount(
                  supplementaryPension,
                  limit,
                ),
              },
            }))
          }
          max={limit}
          step={50}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          22.1% employee social; progressive PIT; supplementary pension premium
          reduces taxable income.
        </InfoPanel>
      }
      seoInfo={<SloveniaTaxInfo />}
    />
  );
}

function SloveniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Slovenia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social</strong> – 22.1% on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Supplementary pension</strong> –
            tax-deductible premium with annual cap.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            16%–50%.
          </li>
        </ul>
      </div>
    </section>
  );
}
