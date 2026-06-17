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
import { ME_SOURCE_URLS } from "@/lib/countries/me/constants/tax-year-2026";
import type { MECalculatorInputs } from "@/lib/countries/me/types";

export default function MECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<MECalculatorInputs>(country);

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
            id="me-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Montenegro does not model employee-controlled voluntary pension top-ups that reduce salary withholding on this page."
          mandatoryLabel="Employee pension 10% (capped) and unemployment 0.5% on gross, then monthly PIT on salary after social."
          sourceUrl={ME_SOURCE_URLS.incomeTax}
          sourceLabel="Montenegro Tax Administration"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Montenegro"
      infoCard={
        <InfoPanel title="Modeled scope">
          Popular with digital nomads using temporary residence. Territorial
          taxation for foreign-sourced remote income is not modeled — this page
          assumes Montenegro employment salary.
        </InfoPanel>
      }
      seoInfo={<MontenegroTaxInfo />}
    />
  );
}

function MontenegroTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Montenegro</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Pension (PIO)</strong> – 10% employee
            on gross, capped at EUR 68,765/year.
          </li>
          <li>
            <strong className="text-zinc-300">Unemployment</strong> – 0.5% employee
            on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – monthly tariff
            on salary after social: 0% to EUR 700, 9% to EUR 1,000, 15% above.
          </li>
        </ul>
      </div>
    </section>
  );
}
