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
import { UA_SOURCE_URLS } from "@/lib/countries/ua/constants/tax-year-2026";
import type { UACalculatorInputs } from "@/lib/countries/ua/types";

export default function UACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<UACalculatorInputs>(country);

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
            id="ua-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            No employee voluntary pension or tax-relief contributions are
            modeled. Personal income tax and military tax are withheld from gross
            salary; employer unified social contribution is shown for reference
            only.
          </p>
          <p>
            <strong className="text-zinc-300">Withheld from salary:</strong> 18%
            personal income tax and 5% military tax on gross employment income.
          </p>
          <p className="text-xs text-zinc-500">
            Source:{" "}
            <a
              href={UA_SOURCE_URLS.personalIncomeTax}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              State Tax Service of Ukraine
            </a>
          </p>
        </div>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your gross salary above"
      infoCard={
        <InfoPanel title="Modeled scope">
          18% PIT plus 5% military tax on gross; employer USC 22% on capped base
          (not deducted from net pay).
        </InfoPanel>
      }
      seoInfo={<UkraineTaxInfo />}
    />
  );
}

function UkraineTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ukraine</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Personal income tax</strong> – flat
            18% on gross employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">Military tax</strong> – 5% on the
            same base as PIT.
          </li>
          <li>
            <strong className="text-zinc-300">Employer USC</strong> – 22% on
            capped base; paid by employer and not deducted from net salary.
          </li>
        </ul>
      </div>
    </section>
  );
}
