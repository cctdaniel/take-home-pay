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
import { LV_SOURCE_URLS } from "@/lib/countries/lv/constants/tax-year-2026";
import type { LVCalculatorInputs } from "@/lib/countries/lv/types";

export default function LVCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<LVCalculatorInputs>(country);

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
            id="lv-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <MandatoryOnlyContributionsNote
          mandatoryLabel="Employee social 10.5% (capped) and PIT 25.5%/33% after EUR 550/month non-taxable minimum."
          sourceUrl={LV_SOURCE_URLS.personalIncomeTax}
          sourceLabel="State Revenue Service (VID)"
          unmodeledVoluntary={['Private pension fund (3rd level) contributions', 'Dependent allowance']}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory items are in your results; optional schemes listed below"
      infoCard={
        <InfoPanel title="Modeled scope">SS capped; fixed NTA; progressive PIT.</InfoPanel>
      }
      seoInfo={<LatviaTaxInfo />}
    />
  );
}

function LatviaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Latvia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li><strong className="text-zinc-300">Social insurance</strong> – 10.5% capped.</li>
          <li><strong className="text-zinc-300">PIT</strong> – 25.5% / 33% after NTA.</li>
        </ul>
      </div>
    </section>
  );
}
