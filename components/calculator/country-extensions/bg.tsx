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
import { NoPitContributionsNote } from "@/components/calculator/no-pit-contributions-note";
import { BG_SOURCE_URLS } from "@/lib/countries/bg/constants/tax-year-2026";
import type { BGCalculatorInputs } from "@/lib/countries/bg/types";

export default function BGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<BGCalculatorInputs>(country);

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
        <NoPitContributionsNote
          mandatoryLabel="Employee social security 13.78% on gross, capped at EUR 2,111.64/month; flat 10% PIT on remaining salary."
          sourceUrl={BG_SOURCE_URLS.taxesAndSocial}
          sourceLabel="Ministry of Labour and Social Policy"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated automatically from your gross salary"
      infoCard={
        <InfoPanel title="Modeled scope">
          13.78% employee social capped monthly; 10% flat PIT after social. No
          voluntary pension top-ups modeled.
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
            <strong className="text-zinc-300">Income tax</strong> – flat 10% on
            gross salary minus employee social security.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary contributions</strong> –
            not modeled; mandatory payroll items are calculated automatically.
          </li>
        </ul>
      </div>
    </section>
  );
}
