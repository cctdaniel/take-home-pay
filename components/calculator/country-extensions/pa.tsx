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
import { PA_SOURCE_URLS } from "@/lib/countries/pa/constants/tax-year-2026";
import type { PACalculatorInputs } from "@/lib/countries/pa/types";

export default function PACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PACalculatorInputs>(country);

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
            id="pa-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Panama does not model employee-controlled voluntary pension contributions that reduce salary PIT on monthly payroll."
          mandatoryLabel="CSS 9.75% and educational insurance 1.25% on gross, then progressive territorial PIT."
          sourceUrl={PA_SOURCE_URLS.incomeTax}
          sourceLabel="Dirección General de Ingresos (DGI)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Panama"
      infoCard={
        <InfoPanel title="Modeled scope">
          Territorial taxation: foreign-sourced remote income is often exempt.
          This calculator models Panama-sourced employment salary only.
        </InfoPanel>
      }
      seoInfo={<PanamaTaxInfo />}
    />
  );
}

function PanamaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Panama</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">CSS</strong> – 9.75% employee
            social security on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Educational insurance</strong> –
            1.25% employee on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            PIT on Panama-sourced salary after social deductions.
          </li>
        </ul>
      </div>
    </section>
  );
}
