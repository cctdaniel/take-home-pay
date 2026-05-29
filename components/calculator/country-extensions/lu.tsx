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
import { LU_SOURCE_URLS } from "@/lib/countries/lu/constants/tax-year-2026";
import type { LUCalculatorInputs } from "@/lib/countries/lu/types";

export default function LUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<LUCalculatorInputs>(country);

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
            id="lu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <MandatoryOnlyContributionsNote
          mandatoryLabel="Employee social security 12.45% on gross up to EUR 140,364 annual insurable base."
          sourceUrl={LU_SOURCE_URLS.socialSecurity}
          sourceLabel="CCSS Luxembourg"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your gross salary above"
      infoCard={
        <InfoPanel title="Modeled scope">
          Capped employee social at 12.45% and progressive income tax on taxable
          salary after social contributions.
        </InfoPanel>
      }
      seoInfo={<LuxembourgTaxInfo />}
    />
  );
}

function MandatoryOnlyContributionsNote({
  mandatoryLabel,
  sourceUrl,
  sourceLabel,
}: {
  mandatoryLabel: string;
  sourceUrl: string;
  sourceLabel: string;
}) {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        No employee voluntary pension or tax-relief contributions are modeled
        for this country. Mandatory payroll deductions are calculated
        automatically from your gross salary above.
      </p>
      <p>
        <strong className="text-zinc-300">Mandatory:</strong> {mandatoryLabel}
      </p>
      <p className="text-xs text-zinc-500">
        Source:{" "}
        <a
          href={sourceUrl}
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {sourceLabel}
        </a>
      </p>
    </div>
  );
}

function LuxembourgTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Luxembourg
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – employee
            contributions at 12.45% on gross up to EUR 140,364 annual base.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            0%–17% on taxable salary after employee social contributions.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://impotsdirects.public.lu/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Administration des contributions directes
          </a>
        </p>
      </div>
    </section>
  );
}
