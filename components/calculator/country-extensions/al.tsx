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
import { AL_SOURCE_URLS } from "@/lib/countries/al/constants/tax-year-2026";
import type { ALCalculatorInputs } from "@/lib/countries/al/types";

export default function ALCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<ALCalculatorInputs>(country);

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
            id="al-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Albania does not model employee-controlled voluntary pension contributions that reduce salary PIT on monthly payroll."
          mandatoryLabel="Social insurance 11.2% capped at ALL 186,416/month, personal deduction ALL 360,000, then progressive PIT."
          sourceUrl={AL_SOURCE_URLS.incomeTax}
          sourceLabel="Albanian Tax Authority"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Albania"
      infoCard={
        <InfoPanel title="Modeled scope">
          Albania offers a flat-tax regime for certain self-employed categories;
          this calculator models standard employment salary tax only.
        </InfoPanel>
      }
      seoInfo={<AlbaniaTaxInfo />}
    />
  );
}

function AlbaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Albania</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – 11.2%
            employee (9.5% + 1.7%) capped at ALL 186,416/month.
          </li>
          <li>
            <strong className="text-zinc-300">Personal deduction</strong> – ALL
            360,000 annual allowance before income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 13% up to
            ALL 2,040,000 taxable, 23% above.
          </li>
        </ul>
      </div>
    </section>
  );
}
