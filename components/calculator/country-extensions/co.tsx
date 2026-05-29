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
import { CO_SOURCE_URLS } from "@/lib/countries/co/constants/tax-year-2026";
import type { COCalculatorInputs } from "@/lib/countries/co/types";

export default function COCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<COCalculatorInputs>(country);

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
            id="co-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <MandatoryOnlyContributionsNote
          mandatoryLabel="Pension 4%, health 4%, solidarity 1% employee; progressive withholding on taxable income."
          sourceUrl={CO_SOURCE_URLS.incomeTax}
          sourceLabel="DIAN Colombia"
          unmodeledVoluntary={['AFC housing/education savings accounts', 'Voluntary pension (Ahorro pensional voluntario)']}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory items are in your results; optional schemes listed below"
      infoCard={
        <InfoPanel title="Modeled scope">Mandatory parafiscales; simplified UVT progressive PIT.</InfoPanel>
      }
      seoInfo={<ColombiaTaxInfo />}
    />
  );
}

function ColombiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Colombia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Parafiscales</strong> – 9% employee.</li>
          <li><strong className="text-zinc-300">PIT</strong> – UVT-based progressive.</li>
        </ul>
      </div>
    </section>
  );
}
