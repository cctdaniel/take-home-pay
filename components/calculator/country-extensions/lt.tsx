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
import { LT_SOURCE_URLS } from "@/lib/countries/lt/constants/tax-year-2026";
import type { LTCalculatorInputs } from "@/lib/countries/lt/types";

export default function LTCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<LTCalculatorInputs>(country);

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
            id="lt-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <MandatoryOnlyContributionsNote
          mandatoryLabel="VSD 19.5% on gross (capped) and progressive GPM 20/25/32% on taxable salary."
          sourceUrl={LT_SOURCE_URLS.personalIncomeTax}
          sourceLabel="VMI Lithuania"
          unmodeledVoluntary={['III-pillar pension tax credit (pre-2025 contracts only)', 'Life insurance premium deductions']}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory items are in your results; optional schemes listed below"
      infoCard={
        <InfoPanel title="Modeled scope">VSD capped at 60 VDU; progressive GPM on salary after VSD.</InfoPanel>
      }
      seoInfo={<LithuaniaTaxInfo />}
    />
  );
}

function LithuaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Lithuania</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">VSD</strong> – 19.5% employee, capped.</li>
          <li><strong className="text-zinc-300">GPM</strong> – 20% / 25% / 32% progressive.</li>
        </ul>
      </div>
    </section>
  );
}
