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
import { NoPitContributionsNote } from "@/components/calculator/no-pit-contributions-note";
import { UY_SOURCE_URLS } from "@/lib/countries/uy/constants/tax-year-2026";
import type { UYCalculatorInputs } from "@/lib/countries/uy/types";

export default function UYCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<UYCalculatorInputs>(country);

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
            id="uy-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="BPS 15%, FRL 0.1%, and FONASA 3% employee contributions on gross; progressive IRPF after social with 7 BPC MNIG exemption."
          sourceUrl={UY_SOURCE_URLS.bps}
          sourceLabel="BPS Uruguay"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated automatically from your gross salary"
      infoCard={
        <InfoPanel title="Modeled scope">
          18.1% employee social; IRPF progressive by BPC bands after social. No
          voluntary AFAP top-ups modeled.
        </InfoPanel>
      }
      seoInfo={<UruguayTaxInfo />}
    />
  );
}

function UruguayTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Uruguay</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – BPS
            15%, FRL 0.1%, FONASA 3% (18.1% total) on gross.
          </li>
          <li>
            <strong className="text-zinc-300">IRPF base</strong> – gross minus
            employee social contributions.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            IRPF with MNIG exempt up to 7 BPC (UYU 576,576/year).
          </li>
        </ul>
      </div>
    </section>
  );
}
