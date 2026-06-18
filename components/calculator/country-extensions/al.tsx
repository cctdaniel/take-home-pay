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
import { AL_SOURCE_URLS } from "@/lib/countries/al/constants/tax-year-2026";
import type { ALCalculatorInputs } from "@/lib/countries/al/types";
import { clampAmount } from "@/lib/utils";

export default function ALCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<ALCalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits().voluntaryPension
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
            id="al-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Private voluntary pension"
          description="Approved private pension fund contributions deductible up to ALL 480,000 per year (minimum wage cap under Law 76/2023)."
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
          step={10_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Standard employment salary tax. Certain self-employed flat-tax
          categories are not modeled here.
        </InfoPanel>
      }
      seoInfo={<AlbaniaTaxInfo />}
    />
  );
}

function AlbaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Albania</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – 11.2%
            employee (9.5% + 1.7%) capped at ALL 186,416/month.
          </li>
          <li>
            <strong className="text-zinc-300">Personal deduction</strong> – ALL
            360,000 annual allowance before income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary pension</strong> –
            private fund contributions deductible up to ALL 480,000/year.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 13% up to
            ALL 2,040,000 taxable, 23% above.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={AL_SOURCE_URLS.voluntaryPension}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Albanian Tax Authority / PwC deductions summary
          </a>
        </p>
      </div>
    </section>
  );
}
