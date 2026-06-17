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
import { EG_SOURCE_URLS } from "@/lib/countries/eg/constants/tax-year-2026";
import type { EGCalculatorInputs } from "@/lib/countries/eg/types";

export default function EGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<EGCalculatorInputs>(country);

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
            id="eg-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Egypt does not model employee-controlled voluntary pension or savings contributions that reduce salary income tax on monthly payroll."
          mandatoryLabel="NOSI employee social insurance (11% capped at EGP 16,700/month) and progressive salary tax after the EGP 20,000 personal exemption."
          sourceUrl={EG_SOURCE_URLS.incomeTax}
          sourceLabel="Egyptian Tax Authority"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Egypt"
      infoCard={
        <InfoPanel title="Modeled scope">
          Employee social insurance 11% capped at EGP 16,700/month, EGP 20,000
          exemption, then progressive PIT. High-earner bracket elimination rule excluded.
        </InfoPanel>
      }
      seoInfo={<EgyptTaxInfo />}
    />
  );
}

function EgyptTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Egypt</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – 11%
            employee share capped at EGP 16,700/month.
          </li>
          <li>
            <strong className="text-zinc-300">Personal exemption</strong> –
            EGP 20,000 annual allowance before income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            rates from 0% to 27.5% on remaining taxable income.
          </li>
        </ul>
      </div>
    </section>
  );
}
