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
import { BD_SOURCE_URLS } from "@/lib/countries/bd/constants/tax-year-2026";
import type { BDCalculatorInputs } from "@/lib/countries/bd/types";

export default function BDCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<BDCalculatorInputs>(country);

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
            id="bd-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Bangladesh does not model employee-controlled voluntary pension or savings contributions that reduce salary income tax on monthly payroll."
          mandatoryLabel="FY 2026-27 progressive salary tax on gross employment income."
          sourceUrl={BD_SOURCE_URLS.incomeTax}
          sourceLabel="National Board of Revenue (NBR)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Bangladesh"
      infoCard={
        <InfoPanel title="Modeled scope">
          FY 2026-27 progressive salary tax slabs. No employee social insurance
          modeled for salaried employees.
        </InfoPanel>
      }
      seoInfo={<BangladeshTaxInfo />}
    />
  );
}

function BangladeshTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Bangladesh
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            FY 2026-27 slabs from 0% to 30% on gross employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – not
            modeled for salaried employees in this calculator.
          </li>
        </ul>
      </div>
    </section>
  );
}
