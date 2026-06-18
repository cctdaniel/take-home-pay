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
import { PY_SOURCE_URLS } from "@/lib/countries/py/constants/tax-year-2026";
import type { PYCalculatorInputs } from "@/lib/countries/py/types";

export default function PYCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PYCalculatorInputs>(country);

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
            id="py-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Paraguay does not model employee-controlled voluntary pension top-ups that reduce salary IRP on monthly payroll."
          mandatoryLabel="IPS employee 9% on gross; IRP on full net income when annual gross exceeds PYG 80,000,000."
          sourceUrl={PY_SOURCE_URLS.incomeTax}
          sourceLabel="Subsecretaría de Estado de Tributación (SET)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Paraguay"
      infoCard={
        <InfoPanel title="Modeled scope">
          Paraguay&apos;s low tax environment attracts remote workers. Temporary
          residency programs and simplified tax regimes are not modeled here.
        </InfoPanel>
      }
      seoInfo={<ParaguayTaxInfo />}
    />
  );
}

function ParaguayTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Paraguay</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">IPS</strong> – 9% employee social
            security on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">IRP</strong> – applies when annual
            gross exceeds PYG 80,000,000; progressive 8%/9%/10% on full net income
            (after IPS).
          </li>
        </ul>
      </div>
    </section>
  );
}
