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
import { UA_SOURCE_URLS } from "@/lib/countries/ua/constants/tax-year-2026";
import type { UACalculatorInputs } from "@/lib/countries/ua/types";

export default function UACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<UACalculatorInputs>(country);

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
            id="ua-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <MandatoryOnlyContributionsNote
          mandatoryLabel="18% personal income tax and 5% military tax withheld from gross salary."
          sourceUrl={UA_SOURCE_URLS.personalIncomeTax}
          sourceLabel="State Tax Service of Ukraine"
          unmodeledVoluntary={['Non-state pension fund contributions (limited regimes)']}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory items are in your results; optional schemes listed below"
      infoCard={
        <InfoPanel title="Modeled scope">23% employee withholding; employer USC not deducted from net.</InfoPanel>
      }
      seoInfo={<UkraineTaxInfo />}
    />
  );
}

function UkraineTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ukraine</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">PIT</strong> – 18% on gross.</li>
          <li><strong className="text-zinc-300">Military tax</strong> – 5% on gross.</li>
        </ul>
      </div>
    </section>
  );
}
