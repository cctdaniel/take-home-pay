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
import { PK_SOURCE_URLS } from "@/lib/countries/pk/constants/tax-year-2026";
import type { PKCalculatorInputs } from "@/lib/countries/pk/types";

export default function PKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PKCalculatorInputs>(country);

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
            id="pk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <MandatoryOnlyContributionsNote
          mandatoryLabel="No employee social security withheld from salary in this model."
          sourceUrl={PK_SOURCE_URLS.incomeTax}
          sourceLabel="FBR Pakistan"
          unmodeledVoluntary={['Voluntary Pension Scheme (VPS) contributions', 'Provident fund (where applicable)']}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory items are in your results; optional schemes listed below"
      infoCard={
        <InfoPanel title="Modeled scope">FY2026 salary slabs only; excludes EOBI employee share.</InfoPanel>
      }
      seoInfo={<PakistanTaxInfo />}
    />
  );
}

function PakistanTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Pakistan</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Income tax</strong> – progressive FY2026 slabs.</li>
        </ul>
      </div>
    </section>
  );
}
