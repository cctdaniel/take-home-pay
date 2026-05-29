"use client";

import {
  CalculatorFieldGrid,
  CountStepperField,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { RO_SOURCE_URLS } from "@/lib/countries/ro/constants/tax-year-2026";
import type { ROCalculatorInputs } from "@/lib/countries/ro/types";
import { clampCount } from "@/lib/utils";

export default function ROCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<ROCalculatorInputs>(country);

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
          <CountStepperField
            spanColumns={2}
            id="ro-children"
            label="Dependent children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfChildren: clampCount(numberOfChildren, 10),
              }))
            }
            max={10}
            description="Additional personal deduction per dependent child."
          />
          <PayFrequencyField
            id="ro-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            No employee voluntary pension or private health contributions are
            modeled. Mandatory CAS and CASS are calculated from gross salary
            above.
          </p>
          <p>
            <strong className="text-zinc-300">Mandatory:</strong> CAS 25% and
            CASS 10% on capped gross base, then 10% income tax on remaining
            taxable income after personal deduction.
          </p>
          <p className="text-xs text-zinc-500">
            Source:{" "}
            <a
              href={RO_SOURCE_URLS.incomeTax}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ANAF (Romanian Tax Authority)
            </a>
          </p>
        </div>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Mandatory payroll deductions are calculated from your gross salary above"
      infoCard={
        <InfoPanel title="Modeled scope">
          CAS 25% and CASS 10% on capped gross, phased personal deduction, 10%
          PIT on taxable remainder.
        </InfoPanel>
      }
      seoInfo={<RomaniaTaxInfo />}
    />
  );
}

function RomaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Romania</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social contributions</strong> –
            CAS 25% and CASS 10% on gross up to the annual cap.
          </li>
          <li>
            <strong className="text-zinc-300">Personal deduction</strong> –
            simplified monthly formula plus allowance per dependent child.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – flat 10% on
            taxable salary after social and personal deduction.
          </li>
        </ul>
      </div>
    </section>
  );
}
