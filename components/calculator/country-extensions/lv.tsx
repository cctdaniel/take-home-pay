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
import { LV_SOURCE_URLS } from "@/lib/countries/lv/constants/tax-year-2026";
import type { LVCalculatorInputs } from "@/lib/countries/lv/types";

export default function LVCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<LVCalculatorInputs>(country);

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
            id="lv-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoPitContributionsNote
          mandatoryLabel="Employee social security 10.5% on gross, capped at EUR 105,300 annually."
          sourceUrl={LV_SOURCE_URLS.socialInsurance}
          sourceLabel="SSIA"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your salary above"
      seoInfo={<LatviaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Employee SS 10.5% capped, EUR 6,600 NTA, and progressive PIT 25.5% /
          33%.
        </InfoPanel>
      }
    />
  );
}

function LatviaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Latvia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social security</strong> – 10.5%
            employee contribution on gross, capped at EUR 105,300 per year.
          </li>
          <li>
            <strong className="text-zinc-300">Non-taxable minimum</strong> – EUR
            550/month (EUR 6,600/year) deducted before PIT.
          </li>
          <li>
            <strong className="text-zinc-300">Personal income tax</strong> –
            25.5% up to EUR 105,300 taxable income and 33% above.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.vid.gov.lv/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            VID
          </a>
          ,{" "}
          <a
            href="https://www.ssia.gov.lv/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SSIA
          </a>
        </p>
      </div>
    </section>
  );
}
