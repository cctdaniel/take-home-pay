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
import { DO_SOURCE_URLS } from "@/lib/countries/do/constants/tax-year-2026";
import type { DOCalculatorInputs } from "@/lib/countries/do/types";

export default function DOCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<DOCalculatorInputs>(country);

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
            id="do-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Ordinary voluntary AFP top-ups are tax-exempt inside your pension account under Ley 87-01 Art. 15, but they are not modeled here as monthly ISR withholding deductions. PwC lists education expenses (up to 10% of gross) as the main employment deduction besides the standard exemption."
          mandatoryLabel="TSS employee 5.91% on gross, then progressive ISR with DOP 416,220 exempt."
          sourceUrl={DO_SOURCE_URLS.incomeTax}
          sourceLabel="Dirección General de Impuestos Internos (DGII)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for the Dominican Republic"
      infoCard={
        <InfoPanel title="Modeled scope">
          Residency programs for remote workers exist, but this calculator
          models standard employment salary withholding only.
        </InfoPanel>
      }
      seoInfo={<DominicanRepublicTaxInfo />}
    />
  );
}

function DominicanRepublicTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Dominican Republic
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">TSS</strong> – 5.91% employee
            (AFP 2.87% + SFS 3.04%) on gross.
          </li>
          <li>
            <strong className="text-zinc-300">ISR</strong> – on salary after TSS
            with DOP 416,220 exempt, then 15%/20%/25% brackets.
          </li>
        </ul>
      </div>
    </section>
  );
}
