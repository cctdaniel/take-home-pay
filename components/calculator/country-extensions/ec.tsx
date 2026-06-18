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
import { EC_SOURCE_URLS } from "@/lib/countries/ec/constants/tax-year-2026";
import type { ECCalculatorInputs } from "@/lib/countries/ec/types";

export default function ECCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<ECCalculatorInputs>(country);

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
            id="ec-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Ecuador does not model employee-controlled voluntary pension or savings contributions that reduce salary withholding on monthly payroll."
          mandatoryLabel="IESS employee 9.45% capped at USD 45,000/year, then progressive SRI tax with USD 12,208 exempt band."
          sourceUrl={EC_SOURCE_URLS.incomeTax}
          sourceLabel="Servicio de Rentas Internas (SRI)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Ecuador"
      infoCard={
        <InfoPanel title="Modeled scope">
          Ecuador uses the US dollar. Digital nomads on temporary visas still
          owe tax on Ecuador-sourced income — foreign remote income sourcing is
          not modeled separately.
        </InfoPanel>
      }
      seoInfo={<EcuadorTaxInfo />}
    />
  );
}

function EcuadorTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ecuador</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">IESS</strong> – 9.45% employee on
            gross capped at USD 45,000/year.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            SRI withholding on salary after IESS, with USD 12,208 exempt band.
          </li>
        </ul>
      </div>
    </section>
  );
}
