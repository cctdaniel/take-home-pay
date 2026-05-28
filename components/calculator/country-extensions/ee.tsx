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
import type { EECalculatorInputs } from "@/lib/countries/ee/types";
import { clampAmount } from "@/lib/utils";

export default function EECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<EECalculatorInputs>(country);
  const thirdPillarLimit =
    getCountryCalculator(country).getContributionLimits(inputs).thirdPillar
      ?.limit ?? 0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="ee-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Third pillar pension"
          description="Deductible contribution up to min(15% of gross, EUR 6,000/year) from income tax base."
          value={inputs.contributions.thirdPillar}
          onChange={(thirdPillar) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                thirdPillar: clampAmount(thirdPillar, thirdPillarLimit),
              },
            }))
          }
          max={thirdPillarLimit}
          step={100}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      seoInfo={<EstoniaTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          Phased basic allowance, 22% income tax, 2% funded pension, 1.6%
          unemployment, and optional third pillar reducing the tax base.
        </InfoPanel>
      }
    />
  );
}

function EstoniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Estonia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Basic allowance</strong> – up to
            EUR 7,848 phases out between EUR 12,000 and EUR 25,200 annual gross.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – flat 22% on
            taxable salary after allowance and third pillar.
          </li>
          <li>
            <strong className="text-zinc-300">Third pillar</strong> – voluntary
            pension up to min(15% gross, EUR 6,000) reduces the tax base.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.emta.ee/en/private-client/taxes-and-payment/income-and-social-taxes"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Estonian Tax and Customs Board (EMTA)
          </a>
        </p>
      </div>
    </section>
  );
}
