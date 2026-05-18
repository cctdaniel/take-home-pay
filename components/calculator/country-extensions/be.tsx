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
import type { BECalculatorInputs } from "@/lib/countries/be/types";

export default function BECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<BECalculatorInputs>(country);

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
            id="be-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      seoInfo={<BelgiumTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in Belgium,
            including federal personal income tax, ONSS/RSZ employee social security, professional expenses, and municipal surcharge proxy.
          </p>
          <p className="mt-2">
            Belgium does not use a US-style joint-return paycheck setup in this
            simplified salary view. Family, dependent, special expatriate,
            municipality, benefit-in-kind, bonus, and employer-only rules are
            documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function BelgiumTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Belgium</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Federal Tax</strong> – Belgian taxable income is taxed with progressive federal bands from 25% to 50% after modeled employee social security and professional expenses.</li>
          <li><strong className="text-zinc-300">ONSS / RSZ</strong> – employee social security is deducted from gross salary and from the income-tax base.</li>
          <li><strong className="text-zinc-300">Municipal Surcharge</strong> – the calculator includes a representative municipal surcharge proxy applied to federal personal income tax instead of taxable salary.</li>
          <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus employee social security, federal tax, and the modeled municipal surcharge.</li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">The model excludes exact commune rates, personal allowance refinements, marital quotient, dependent children, work bonus reductions, regional reductions, benefits in kind, and the special expatriate regime.</p>
      </div>
    </section>
  );
}
