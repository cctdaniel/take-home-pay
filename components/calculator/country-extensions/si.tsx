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
import { MandatoryOnlyContributionsNote } from "@/components/calculator/mandatory-only-contributions-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import { SI_SOURCE_URLS } from "@/lib/countries/si/constants/tax-year-2026";
import type { SICalculatorInputs } from "@/lib/countries/si/types";

export default function SICountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<SICalculatorInputs>(country);

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
        <MandatoryOnlyContributionsNote
          mandatoryLabel="Employee social 22.1% on gross and progressive income tax on taxable salary."
          sourceUrl={SI_SOURCE_URLS.personalIncomeTax}
          sourceLabel="FURS Slovenia"
          unmodeledVoluntary={['Supplementary pension insurance premiums', 'Disability insurance top-ups']}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory items are in your results; optional schemes listed below"
      infoCard={
        <InfoPanel title="Modeled scope">22.1% social; progressive PIT 16%–50%.</InfoPanel>
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
          <li><strong className="text-zinc-300">Social</strong> – 22.1% employee.</li>
          <li><strong className="text-zinc-300">PIT</strong> – progressive 16%–50%.</li>
        </ul>
      </div>
    </section>
  );
}
