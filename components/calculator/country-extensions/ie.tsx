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
import type { IECalculatorInputs } from "@/lib/countries/ie/types";

export default function IECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<IECalculatorInputs>(country);

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
            id="ie-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      seoInfo={<IrelandTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in Ireland,
            including PAYE income tax, employee PRSI, Universal Social Charge, and standard single PAYE credits.
          </p>
          <p className="mt-2">
            Ireland does not use a US-style joint-return paycheck setup in this
            simplified salary view. Family, dependent, special expatriate,
            municipality, benefit-in-kind, bonus, and employer-only rules are
            documented in the page notes where excluded.
          </p>
        </InfoPanel>
      }
    />
  );
}

function IrelandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ireland</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">PAYE Income Tax</strong> – the single employee standard-rate band is taxed at 20% and income above the band at 40%.</li>
          <li><strong className="text-zinc-300">Tax Credits</strong> – the standard personal and employee PAYE credits are applied against income tax.</li>
          <li><strong className="text-zinc-300">PRSI and USC</strong> – employee PRSI and Universal Social Charge are added as payroll deductions separate from PAYE income tax; USC is zero when annual income is within the exemption limit.</li>
          <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus PAYE after credits, PRSI, and USC.</li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">The model excludes married/civil-partner bands, age or medical-card USC rules, pension relief, benefit-in-kind detail, and week-one payroll timing.</p>
      </div>
    </section>
  );
}
