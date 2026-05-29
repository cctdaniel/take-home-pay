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
import { CL_SOURCE_URLS } from "@/lib/countries/cl/constants/tax-year-2026";
import type { CLCalculatorInputs } from "@/lib/countries/cl/types";

export default function CLCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<CLCalculatorInputs>(country);

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
            id="cl-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            No voluntary APV pension or other tax-relief contributions are
            modeled. Mandatory AFP, health, and unemployment deductions are
            calculated from gross salary above.
          </p>
          <p>
            <strong className="text-zinc-300">Mandatory:</strong> AFP 10%,
            health 7%, unemployment 0.6% employee on gross.
          </p>
          <p className="text-xs text-zinc-500">
            Source:{" "}
            <a
              href={CL_SOURCE_URLS.incomeTax}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Servicio de Impuestos Internos (SII)
            </a>
          </p>
        </div>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your gross salary above"
      infoCard={
        <InfoPanel title="Modeled scope">
          AFP 10%, health 7%, unemployment 0.6% on gross; simplified SII
          progressive table on annual taxable income after mandatory deductions.
        </InfoPanel>
      }
      seoInfo={<ChileTaxInfo />}
    />
  );
}

function ChileTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Chile</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Mandatory deductions</strong> – AFP
            pension 10%, health 7%, unemployment 0.6% on gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – simplified
            monthly SII table annualized; progressive 0%–40% on taxable income
            after mandatory deductions.
          </li>
        </ul>
      </div>
    </section>
  );
}
