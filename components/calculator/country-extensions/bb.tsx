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
import { BB_SOURCE_URLS } from "@/lib/countries/bb/constants/tax-year-2026";
import type { BBCalculatorInputs } from "@/lib/countries/bb/types";

export default function BBCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<BBCalculatorInputs>(country);

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
            id="bb-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Barbados does not model employee-controlled voluntary pension contributions that reduce salary PAYE on monthly payroll."
          mandatoryLabel="NIS 11% capped at BBD 5,280/month, Resilience Fund 0.25% on gross, then PAYE after BBD 25,000 allowance."
          sourceUrl={BB_SOURCE_URLS.incomeTax}
          sourceLabel="Barbados Revenue Authority (BRA)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Barbados"
      infoCard={
        <InfoPanel title="Modeled scope">
          Welcome Stamp and other remote-work visas may involve different
          sourcing rules. NIS is not deductible from the PAYE base.
        </InfoPanel>
      }
      seoInfo={<BarbadosTaxInfo />}
    />
  );
}

function BarbadosTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Barbados</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">NIS</strong> – 11% employee on
            gross capped at BBD 5,280/month (not deductible from PAYE).
          </li>
          <li>
            <strong className="text-zinc-300">Resilience Fund</strong> – 0.25%
            employee levy on gross.
          </li>
          <li>
            <strong className="text-zinc-300">PAYE</strong> – on income after
            BBD 25,000 allowance: 12.5% to BBD 50,000 taxable, 28.5% above.
          </li>
        </ul>
      </div>
    </section>
  );
}
