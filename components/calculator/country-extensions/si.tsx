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
import { SI_SOURCE_URLS } from "@/lib/countries/si/constants/tax-year-2026";
import type { SICalculatorInputs } from "@/lib/countries/si/types";

export default function SICountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<SICalculatorInputs>(country);

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
            id="si-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="Employee social contributions 22.1% on gross are calculated automatically."
          sourceUrl={SI_SOURCE_URLS.socialInsurance}
          sourceLabel="ZPIZ"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your salary above"
      seoInfo={<SloveniaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Employee social 22.1% on gross and progressive PIT 16% through 50% on
          taxable salary after social.
        </InfoPanel>
      }
    />
  );
}

function SloveniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Slovenia
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social contributions</strong> –
            22.1% employee share on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Personal income tax</strong> –
            progressive rates 16% / 26% / 33% / 39% / 50% on gross minus employee
            social.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.fu.gov.si/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            FURS
          </a>
          ,{" "}
          <a
            href="https://www.zpiz.si/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ZPIZ
          </a>
        </p>
      </div>
    </section>
  );
}
