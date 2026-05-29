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
import { LT_SOURCE_URLS } from "@/lib/countries/lt/constants/tax-year-2026";
import type { LTCalculatorInputs } from "@/lib/countries/lt/types";

export default function LTCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<LTCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="lt-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="Employee VSD social insurance 19.5% on gross, capped at EUR 138,729 annually."
          sourceUrl={LT_SOURCE_URLS.socialInsurance}
          sourceLabel="SODRA"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your salary above"
      seoInfo={<LithuaniaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Employee VSD 19.5% capped and progressive GPM 20% / 25% / 32% on gross
          minus VSD.
        </InfoPanel>
      }
    />
  );
}

function LithuaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Lithuania
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">VSD</strong> – employee social
            insurance 19.5% on gross, capped at EUR 138,729 per year.
          </li>
          <li>
            <strong className="text-zinc-300">GPM</strong> – progressive
            personal income tax at 20% up to EUR 83,237.40, 25% to EUR 138,729,
            and 32% above on gross minus VSD.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.vmi.lt/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            VMI
          </a>
          ,{" "}
          <a
            href="https://www.sodra.lt/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SODRA
          </a>
        </p>
      </div>
    </section>
  );
}
