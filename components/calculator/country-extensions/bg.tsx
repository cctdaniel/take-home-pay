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
import { BG_SOURCE_URLS } from "@/lib/countries/bg/constants/tax-year-2026";
import type { BGCalculatorInputs } from "@/lib/countries/bg/types";
import { clampAmount } from "@/lib/utils";

export default function BGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<BGCalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).voluntaryPension
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
            id="bg-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary supplementary pension"
          description="Third-pillar pension contributions reduce your income tax base up to 10% of annual taxable income after social security."
          value={inputs.contributions.voluntaryPension}
          onChange={(voluntaryPension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                voluntaryPension: clampAmount(voluntaryPension, limit),
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
          13.78% employee social capped monthly; 10% flat PIT after social and
          voluntary pension.
        </InfoPanel>
      }
      seoInfo={<BulgariaTaxInfo />}
    />
  );
}

function BulgariaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Bulgaria</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – 13.78%
            employee on gross, capped at EUR 2,111.64 per month.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary pension</strong> –
            deductible up to 10% of the tax base (NRA Art. 19).
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – flat 10% on
            gross minus employee social security and voluntary pension.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={BG_SOURCE_URLS.nra}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bulgarian National Revenue Agency
          </a>
        </p>
      </div>
    </section>
  );
}
