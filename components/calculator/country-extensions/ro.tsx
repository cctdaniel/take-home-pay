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
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import type { ROCalculatorInputs } from "@/lib/countries/ro/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function ROCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<ROCalculatorInputs>(country);
  const privatePensionLimit =
    getCountryCalculator(country).getContributionLimits().privatePension?.limit ??
    0;

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
        <ContributionSlider
          label="Voluntary private pension (Pillar III)"
          description="Payroll contributions reduce the income tax base up to EUR 400 per year."
          value={inputs.contributions.privatePension}
          onChange={(privatePension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                privatePension: clampAmount(privatePension, privatePensionLimit),
              },
            }))
          }
          max={privatePensionLimit}
          step={50}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          CAS 25% and CASS 10% on capped gross, personal deduction, optional Pillar
          III, then 10% PIT.
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
            <strong className="text-zinc-300">CAS / CASS</strong> – 25% and 10%
            employee on capped gross.
          </li>
          <li>
            <strong className="text-zinc-300">Pillar III</strong> – up to EUR
            400/year reduces the income tax base.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 10% flat on
            taxable income after deductions.
          </li>
        </ul>
      </div>
    </section>
  );
}
