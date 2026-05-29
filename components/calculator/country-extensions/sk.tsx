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
import { SK_SOURCE_URLS } from "@/lib/countries/sk/constants/tax-year-2026";
import type { SKCalculatorInputs } from "@/lib/countries/sk/types";

export default function SKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<SKCalculatorInputs>(country);

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
            id="sk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="Employee social insurance 9.4% (capped) and health insurance 5% on gross are calculated automatically."
          sourceUrl={SK_SOURCE_URLS.socialInsurance}
          sourceLabel="Slovak Social Insurance Agency"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your salary above"
      seoInfo={<SlovakiaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Progressive PIT after social, health, and NCZD; employee social 9.4%
          capped and health 5% uncapped.
        </InfoPanel>
      }
    />
  );
}

function SlovakiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Slovakia
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – 9.4%
            employee contribution on gross, capped at EUR 16,764/month
            annualized.
          </li>
          <li>
            <strong className="text-zinc-300">Health insurance</strong> – 5% on
            gross with no cap.
          </li>
          <li>
            <strong className="text-zinc-300">Non-taxable amount</strong> – EUR
            5,966.73 when pre-allowance base is at or below EUR 43,983.32.
          </li>
          <li>
            <strong className="text-zinc-300">Personal income tax</strong> –
            progressive 19% / 25% / 30% / 35% on taxable salary.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.financnasprava.sk/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Finančná správa SR
          </a>
          ,{" "}
          <a
            href="https://www.socpoist.sk/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sociálna poisťovňa
          </a>
        </p>
      </div>
    </section>
  );
}
