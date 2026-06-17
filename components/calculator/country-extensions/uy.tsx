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
        <NoVoluntaryPitReliefNote
          explanation="Uruguay has tax-deductible voluntary AFAP contributions (similar in spirit to SRS/401k), but relief is typically claimed on the annual IRPF return rather than in monthly BPS withholding. This calculator models mandatory BPS/FONASA only."
          mandatoryLabel="BPS 15%, FRL 0.1%, and FONASA 3% employee contributions; progressive IRPF after social with 7 BPC MNIG exemption."
          sourceUrl={UY_SOURCE_URLS.bps}
          sourceLabel="BPS Uruguay"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Voluntary AFAP top-ups exist but are not modeled on monthly payroll"
      infoCard={
        <InfoPanel title="Modeled scope">
          18.1% employee social; IRPF progressive by BPC bands after social.
          Voluntary AFAP deductible via annual return — not in monthly slider.
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
            <strong className="text-zinc-300">Voluntary AFAP</strong> – exists
            and reduces IRPF, but is claimed on the annual tax return (not
            modeled here).
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
