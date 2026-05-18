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
import type { FRCalculatorInputs } from "@/lib/countries/fr/types";

export default function FRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<FRCalculatorInputs>(country);

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
            id="fr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      seoInfo={<FranceTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in France,
            including French income tax, employee social contributions, and 10% employment expense deduction.
          </p>
          <p className="mt-2">
            France does not use a US-style joint-return paycheck setup in this
            simplified salary view. Family, dependent, special expatriate,
            municipality, benefit-in-kind, bonus, and employer-only rules are
            documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function FranceTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">France</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Income Tax</strong> – taxable salary is calculated after the modeled 10% employment expense deduction and taxed with France&apos;s progressive bands from 0% to 45%.</li>
          <li><strong className="text-zinc-300">Employee Contributions</strong> – mandatory employee social contributions are modeled as a combined payroll deduction because exact rates vary by tranche, scheme, and employment status.</li>
          <li><strong className="text-zinc-300">Filing Status</strong> – the calculator assumes one ordinary resident employee and does not expose family quotient parts or spouse/dependent inputs.</li>
          <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus modeled employee social contributions and progressive income tax after the expense deduction.</li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">The model excludes personalized withholding rates, detailed pension tranche rates, family quotient effects, social surcharge detail, benefits in kind, and employer-only charges.</p>
      </div>
    </section>
  );
}
