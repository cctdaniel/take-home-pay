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
import { PK_SOURCE_URLS } from "@/lib/countries/pk/constants/tax-year-2026";
import type { PKCalculatorInputs } from "@/lib/countries/pk/types";

export default function PKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PKCalculatorInputs>(country);

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
            id="pk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            No employee voluntary retirement or tax-relief contributions are
            modeled for salaried employees. Employer EOBI is not deducted from
            net salary in this model.
          </p>
          <p>
            <strong className="text-zinc-300">Mandatory:</strong> none modeled
            as employee salary deductions.
          </p>
          <p className="text-xs text-zinc-500">
            Source:{" "}
            <a
              href={PK_SOURCE_URLS.incomeTax}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Federal Board of Revenue (FBR)
            </a>
          </p>
        </div>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your gross salary above"
      infoCard={
        <InfoPanel title="Modeled scope">
          FY2026 progressive salary tax slabs on gross employment income; no
          employee social insurance deduction.
        </InfoPanel>
      }
      seoInfo={<PakistanTaxInfo />}
    />
  );
}

function PakistanTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Pakistan</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – FY2026
            progressive slabs from 0% to 35% on gross employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">Social insurance</strong> – no
            employee deduction modeled for salaried workers.
          </li>
        </ul>
      </div>
    </section>
  );
}
