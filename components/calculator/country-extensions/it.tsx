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
import type { ITCalculatorInputs } from "@/lib/countries/it/types";

export default function ITCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<ITCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="it-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      seoInfo={<ItalyTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in Italy,
            including IRPEF, employee INPS social security, employment tax credit, and average local add-ons.
          </p>
          <p className="mt-2">
            Italy does not use a US-style joint-return paycheck setup in this
            simplified salary view. Family, dependent, special expatriate,
            municipality, benefit-in-kind, bonus, and employer-only rules are
            documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ItalyTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Italy</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">IRPEF</strong> – employment income after modeled employee INPS contributions is taxed through Italy&apos;s 23%, 35%, and 43% national bands.</li>
          <li><strong className="text-zinc-300">Employment Credit</strong> – a simplified employee tax credit is applied and tapered by gross salary.</li>
          <li><strong className="text-zinc-300">Local Add-ons</strong> – regional and municipal addizionale are represented with an average proxy so the page remains usable without region selection.</li>
          <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus INPS, national IRPEF after credit, and modeled local add-ons.</li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">The model excludes exact regional and commune rates, spouse/dependent deductions, bonus and exoneration programs, severance pay, fringe benefits, and employer-only costs.</p>
      </div>
    </section>
  );
}
