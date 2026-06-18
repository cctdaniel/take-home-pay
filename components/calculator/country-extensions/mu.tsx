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
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { MU_SOURCE_URLS } from "@/lib/countries/mu/constants/tax-year-2026";
import type { MUCalculatorInputs } from "@/lib/countries/mu/types";

export default function MUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<MUCalculatorInputs>(country);

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
            id="mu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Mauritius does not model employee-controlled voluntary pension or savings contributions that reduce salary PAYE on monthly payroll."
          mandatoryLabel="CSG 1.5% or 3% on gross by monthly tier, then PAYE on income after CSG."
          sourceUrl={MU_SOURCE_URLS.incomeTax}
          sourceLabel="Mauritius Revenue Authority (MRA)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Mauritius"
      infoCard={
        <InfoPanel title="Modeled scope">
          Premium Visa and remote-work permit holders may have different
          sourcing rules. Solidarity Levy excluded; Fair Share included above MUR
          12M/year.
        </InfoPanel>
      }
      seoInfo={<MauritiusTaxInfo />}
    />
  );
}

function MauritiusTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Mauritius</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">CSG</strong> – 1.5% when monthly
            gross is MUR 50,000 or below, otherwise 3%.
          </li>
          <li>
            <strong className="text-zinc-300">PAYE</strong> – on income after
            CSG: 0% first MUR 500,000, 10% next MUR 500,000, 20% above.
          </li>
          <li>
            <strong className="text-zinc-300">Fair Share</strong> – 15% on
            monthly emoluments above MUR 923,077 (MUR 12M/year threshold).
          </li>
        </ul>
      </div>
    </section>
  );
}
