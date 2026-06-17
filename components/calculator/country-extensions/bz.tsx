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
import { BZ_SOURCE_URLS } from "@/lib/countries/bz/constants/tax-year-2026";
import type { BZCalculatorInputs } from "@/lib/countries/bz/types";

export default function BZCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<BZCalculatorInputs>(country);

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
            id="bz-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Belize does not model employee-controlled voluntary pension contributions that reduce salary income tax on monthly payroll."
          mandatoryLabel="Employee social security ~4.5% capped at BZD 520/week, then 25% PIT above BZD 29,000 exemption."
          sourceUrl={BZ_SOURCE_URLS.incomeTax}
          sourceLabel="Belize Tax Service"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Belize"
      infoCard={
        <InfoPanel title="Modeled scope">
          Qualified Retirement Program (QRP) and foreign-sourced income
          exemptions for residents are not modeled — standard employment salary
          only.
        </InfoPanel>
      }
      seoInfo={<BelizeTaxInfo />}
    />
  );
}

function BelizeTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Belize</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – ~4.5%
            employee on insurable earnings capped at BZD 520/week (max ~BZD
            1,217/year).
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 25% flat on
            annual gross above BZD 29,000 exemption.
          </li>
        </ul>
      </div>
    </section>
  );
}
