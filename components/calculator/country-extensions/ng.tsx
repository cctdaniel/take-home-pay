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
import { NG_SOURCE_URLS } from "@/lib/countries/ng/constants/tax-year-2026";
import type { NGCalculatorInputs } from "@/lib/countries/ng/types";

export default function NGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<NGCalculatorInputs>(country);

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
            id="ng-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Nigeria's mandatory 8% pension contribution is already deducted before PAYE. Voluntary additional voluntary contributions (AVC) and other optional pension top-ups are not modeled here."
          mandatoryLabel="Employee pension 8% of gross and NTA 2025 PAYE on chargeable income."
          sourceUrl={NG_SOURCE_URLS.pension}
          sourceLabel="National Pension Commission (PenCom)"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory pension is automatic; voluntary top-ups not modeled"
      infoCard={
        <InfoPanel title="Modeled scope">
          Mandatory pension 8% before NTA 2025 PAYE Fourth Schedule brackets.
          Consolidated relief allowance and NHF excluded.
        </InfoPanel>
      }
      seoInfo={<NigeriaTaxInfo />}
    />
  );
}

function NigeriaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Nigeria</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Pension</strong> – mandatory 8%
            employee contribution deducted from gross before tax.
          </li>
          <li>
            <strong className="text-zinc-300">PAYE</strong> – NTA 2025
            progressive rates from 0% to 25% on chargeable income.
          </li>
        </ul>
      </div>
    </section>
  );
}
