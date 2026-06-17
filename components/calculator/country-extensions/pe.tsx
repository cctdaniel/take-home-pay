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
import { PE_SOURCE_URLS } from "@/lib/countries/pe/constants/tax-year-2026";
import type { PECalculatorInputs } from "@/lib/countries/pe/types";

export default function PECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PECalculatorInputs>(country);

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
            id="pe-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="Employee pension ~13% on gross; progressive fifth-category income tax after 7 UIT (PEN 38,500) deduction."
          sourceUrl={PE_SOURCE_URLS.sunat}
          sourceLabel="SUNAT"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated automatically from your gross salary"
      infoCard={
        <InfoPanel title="Modeled scope">
          13% pension; 7 UIT deduction; progressive PIT 8%–30%. AFP voluntary
          top-ups not modeled.
        </InfoPanel>
      }
      seoInfo={<PeruTaxInfo />}
    />
  );
}

function PeruTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Peru</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Pension</strong> – ~13% employee
            contribution on gross (ONP/AFP blended).
          </li>
          <li>
            <strong className="text-zinc-300">Work-income deduction</strong> –
            7 UIT (PEN 38,500) subtracted before income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            fifth-category rates from 8% to 30%.
          </li>
        </ul>
      </div>
    </section>
  );
}
