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
import type { PKCalculatorInputs } from "@/lib/countries/pk/types";
import { clampAmount } from "@/lib/utils";

export default function PKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PKCalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).vpsContribution
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
            id="pk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary Pension Scheme (VPS)"
          description="Tax credit on contributions up to 20% of annual taxable income (Section 63)."
          value={inputs.contributions.vpsContribution}
          onChange={(vpsContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                vpsContribution: clampAmount(vpsContribution, limit),
              },
            }))
          }
          max={limit}
          step={10_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          FY2026 salary slabs; VPS reduces taxable income up to 20% of gross.
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
            <strong className="text-zinc-300">Income tax</strong> – progressive
            FY2026 slabs on taxable salary.
          </li>
          <li>
            <strong className="text-zinc-300">VPS</strong> – contributions up to
            20% of taxable income reduce the tax base.
          </li>
        </ul>
      </div>
    </section>
  );
}
