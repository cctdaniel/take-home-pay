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
import { RS_SOURCE_URLS } from "@/lib/countries/rs/constants/tax-year-2026";
import type { RSCalculatorInputs } from "@/lib/countries/rs/types";
import { clampAmount } from "@/lib/utils";

export default function RSCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<RSCalculatorInputs>(country);
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
            id="rs-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary private pension fund"
          description="Payroll contributions up to RSD 8,677/month are exempt from income tax and social security."
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
          step={1_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          19.9% employee social capped; RSD 34,221/month non-taxable; 10% flat
          PIT after social and voluntary pension.
        </InfoPanel>
      }
      seoInfo={<SerbiaTaxInfo />}
    />
  );
}

function SerbiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Serbia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – 19.9%
            employee (PIO, health, unemployment) on gross, capped at RSD
            732,820/month.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary pension</strong> – up
            to RSD 8,677/month via payroll is tax-exempt.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – flat 10%
            after social, non-taxable minimum, and voluntary pension.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={RS_SOURCE_URLS.purs}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Serbian Tax Administration (PURS)
          </a>
        </p>
      </div>
    </section>
  );
}
