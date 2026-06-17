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
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import {
  MA_DEPENDENT_CREDIT_2026,
  MA_SOURCE_URLS,
} from "@/lib/countries/ma/constants/tax-year-2026";
import type { MACalculatorInputs } from "@/lib/countries/ma/types";
import { clampCount } from "@/lib/utils";

export default function MACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<MACalculatorInputs>(country);

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
            id="ma-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CountStepperField
            spanColumns={2}
            id="ma-dependents"
            label="Dependents"
            value={inputs.dependents}
            onChange={(dependents) =>
              setInputs((current) => ({
                ...current,
                dependents: clampCount(
                  dependents,
                  MA_DEPENDENT_CREDIT_2026.maxDependents,
                ),
              }))
            }
            max={MA_DEPENDENT_CREDIT_2026.maxDependents}
            description="MAD 360/month tax credit per dependent (max 6)."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Morocco does not model employee-controlled voluntary pension or savings contributions that reduce salary income tax on monthly payroll."
          mandatoryLabel="CNSS and AMO social contributions, professional expense deduction, and progressive IR with dependent credits."
          sourceUrl={MA_SOURCE_URLS.incomeTax}
          sourceLabel="Direction Générale des Impôts"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No voluntary tax-reducing contributions modeled for Morocco"
      infoCard={
        <InfoPanel title="Modeled scope">
          CNSS 4.48% (capped) + AMO 2.26%, 20% professional expenses (max MAD
          30,000), progressive IR, and dependent credits.
        </InfoPanel>
      }
      seoInfo={<MoroccoTaxInfo />}
    />
  );
}

function MoroccoTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Morocco</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Social contributions</strong> –
            CNSS 4.48% capped at MAD 6,000/month plus AMO 2.26% on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Professional expenses</strong> –
            20% of (gross − social), capped at MAD 30,000/year.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax (IR)</strong> –
            progressive rates from 0% to 37% on net taxable income.
          </li>
          <li>
            <strong className="text-zinc-300">Dependents</strong> – MAD 360/month
            credit per dependent (up to 6).
          </li>
        </ul>
      </div>
    </section>
  );
}
