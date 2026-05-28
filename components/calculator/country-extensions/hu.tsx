"use client";

import {
  BooleanSelectField,
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
import type { HUCalculatorInputs } from "@/lib/countries/hu/types";
import { clampAmount } from "@/lib/utils";

export default function HUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<HUCalculatorInputs>(country);
  const voluntaryPensionLimit =
    getCountryCalculator(country).getContributionLimits().voluntaryPension
      ?.limit ?? 0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={3}>
          <CountStepperField
            spanColumns={3}
            id="hu-children"
            label="Dependent children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({ ...current, numberOfChildren }))
            }
            min={0}
            max={10}
          />
          <BooleanSelectField
            id="hu-under-25"
            label="Under-25 full PIT exemption"
            value={inputs.under25FullExemption}
            onChange={(under25FullExemption) =>
              setInputs((current) => ({ ...current, under25FullExemption }))
            }
            description="Optional young-worker personal income tax exemption; social security still applies."
          />
          <PayFrequencyField
            id="hu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary pension fund"
          description="Önkéntes nyugdíjpénztár reducing PIT base before 15%, capped HUF 1,560,000/year."
          value={inputs.contributions.voluntaryPension}
          onChange={(voluntaryPension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                voluntaryPension: clampAmount(
                  voluntaryPension,
                  voluntaryPensionLimit,
                ),
              },
            }))
          }
          max={voluntaryPensionLimit}
          step={10_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      seoInfo={<HungaryTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Flat 15% PIT after family allowance and voluntary pension, plus 18.5%
          employee TB on gross.
        </InfoPanel>
      }
    />
  );
}

function HungaryTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Hungary</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Family allowance</strong> – HUF
            66,670/month per child reduces the PIT base.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary pension</strong> – up to
            HUF 1,560,000/year further reduces the PIT base.
          </li>
          <li>
            <strong className="text-zinc-300">Personal income tax</strong> – 15%
            flat rate on taxable salary unless under-25 exemption applies.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://nav.gov.hu/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            NAV (Hungarian Tax Authority)
          </a>
        </p>
      </div>
    </section>
  );
}
