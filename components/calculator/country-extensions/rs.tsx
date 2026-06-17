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
import { RS_SOURCE_URLS } from "@/lib/countries/rs/constants/tax-year-2026";
import type { RSCalculatorInputs } from "@/lib/countries/rs/types";

export default function RSCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<RSCalculatorInputs>(country);

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
        <NoPitContributionsNote
          mandatoryLabel="Employee social 19.9% on gross (capped monthly); flat 10% PIT after social and RSD 410,652 annual non-taxable amount."
          sourceUrl={RS_SOURCE_URLS.purs}
          sourceLabel="Serbian Tax Administration (PURS)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated automatically from your gross salary"
      infoCard={
        <InfoPanel title="Modeled scope">
          19.9% employee social capped; RSD 34,221/month non-taxable; 10% flat
          PIT. No voluntary deductions modeled.
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
            <strong className="text-zinc-300">Non-taxable amount</strong> – RSD
            410,652 per year deducted before income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – flat 10% on
            remaining taxable salary.
          </li>
        </ul>
      </div>
    </section>
  );
}
