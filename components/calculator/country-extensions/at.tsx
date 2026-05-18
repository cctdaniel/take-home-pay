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
import type { ATCalculatorInputs } from "@/lib/countries/at/types";

export default function ATCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<ATCalculatorInputs>(country);

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
            id="at-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      seoInfo={<AustriaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in Austria,
            including progressive wage tax and capped employee social insurance.
          </p>
          <p className="mt-2">
            Austria does not use a US-style joint-return paycheck setup in this
            simplified salary view. Family, dependent, special expatriate,
            municipality, benefit-in-kind, bonus, and employer-only rules are
            documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function AustriaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Austria</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Wage Tax</strong> – annual salary after modeled employee social insurance is taxed with Austria&apos;s progressive wage tax bands from 0% to 55%.</li>
          <li><strong className="text-zinc-300">Social Insurance</strong> – employee social insurance is modeled at a general employee rate and capped at the annualized contribution-base ceiling.</li>
          <li><strong className="text-zinc-300">No Regional Income Tax</strong> – Austria does not use US-style state income tax for salary employees in this model.</li>
          <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus capped employee social insurance and wage tax on the remaining taxable base.</li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">The model excludes 13th/14th salary preferential taxation, commuter and family credits, church contributions, in-kind benefits, and detailed monthly payroll cap timing.</p>
      </div>
    </section>
  );
}
