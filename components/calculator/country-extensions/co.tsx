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
import { CO_SOURCE_URLS } from "@/lib/countries/co/constants/tax-year-2026";
import type { COCalculatorInputs } from "@/lib/countries/co/types";

export default function COCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<COCalculatorInputs>(country);

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
            id="co-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            No voluntary AFC pension or other tax-relief contributions are
            modeled. Mandatory pension, health, and solidarity fund deductions
            are calculated from gross salary above.
          </p>
          <p>
            <strong className="text-zinc-300">Mandatory:</strong> pension 4%,
            health 4%, solidarity 1% employee on gross.
          </p>
          <p className="text-xs text-zinc-500">
            Source:{" "}
            <a
              href={CO_SOURCE_URLS.socialSecurity}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ministerio del Trabajo
            </a>
          </p>
        </div>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your gross salary above"
      infoCard={
        <InfoPanel title="Modeled scope">
          Pension 4%, health 4%, solidarity 1% on gross; UVT-based progressive
          withholding on taxable income after mandatory contributions.
        </InfoPanel>
      }
      seoInfo={<ColombiaTaxInfo />}
    />
  );
}

function ColombiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Colombia
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Mandatory deductions</strong> –
            pension 4%, health 4%, solidarity 1% on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – simplified
            UVT-based progressive withholding on taxable income after
            contributions.
          </li>
        </ul>
      </div>
    </section>
  );
}
