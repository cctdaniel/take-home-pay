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
import {
  MA_DEPENDENT_CREDIT_2026,
  MA_SOURCE_URLS,
} from "@/lib/countries/ma/constants/tax-year-2026";
import type { MACalculatorInputs } from "@/lib/countries/ma/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function MACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<MACalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).supplementaryPension
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
            description="MAD 600/year tax credit per dependent (max MAD 3,600 total)."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Supplementary retirement (CIMR)"
          description="Employee supplementary pension contributions deductible up to 50% of net taxable salary (CGI art. 28-III)."
          value={inputs.contributions.supplementaryPension}
          onChange={(supplementaryPension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                supplementaryPension: clampAmount(supplementaryPension, limit),
              },
            }))
          }
          max={limit}
          step={1_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          CNSS + AMO, 20% professional expenses, CIMR supplementary pension,
          progressive IR, and dependent credits.
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
            <strong className="text-zinc-300">CIMR</strong> – supplementary
            pension deductible up to 50% of net taxable salary.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax (IR)</strong> –
            progressive rates from 0% to 37% on net taxable income.
          </li>
          <li>
            <strong className="text-zinc-300">Dependents</strong> – MAD 600/year
            credit per dependent (max MAD 3,600).
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={MA_SOURCE_URLS.incomeTax}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Direction Générale des Impôts
          </a>
        </p>
      </div>
    </section>
  );
}
