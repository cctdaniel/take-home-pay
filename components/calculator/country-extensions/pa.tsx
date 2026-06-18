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
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { PA_SOURCE_URLS } from "@/lib/countries/pa/constants/tax-year-2026";
import type { PACalculatorInputs } from "@/lib/countries/pa/types";
import { clampAmount } from "@/lib/utils";

export default function PACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PACalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).voluntaryPension
      ?.limit ?? 0;

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
            id="pa-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary pension (Law 10/1993)"
          description="Approved private pension contributions reduce salary PIT up to 10% of gross or USD 15,000 per year."
          value={inputs.contributions.voluntaryPension}
          onChange={(voluntaryPension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                voluntaryPension: clampAmount(voluntaryPension, limit),
              },
            }))
          }
          max={limit}
          step={500}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Territorial taxation: foreign-sourced remote income is often exempt.
          This calculator models Panama-sourced employment salary only.
        </InfoPanel>
      }
      seoInfo={<PanamaTaxInfo />}
    />
  );
}

function PanamaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Panama</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">CSS</strong> – 9.75% employee
            social security on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Educational insurance</strong> –
            1.25% employee on gross.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary pension</strong> –
            deductible before PIT up to min(10% gross, USD 15,000) under Law
            10/1993.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            PIT on Panama-sourced salary after social and voluntary pension.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={PA_SOURCE_URLS.pensionLaw}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Law 10/1993 (Superintendencia de Bancos)
          </a>
        </p>
      </div>
    </section>
  );
}
