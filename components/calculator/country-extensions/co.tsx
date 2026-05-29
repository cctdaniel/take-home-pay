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
import { getColombiaVoluntaryCombinedLimit } from "@/lib/countries/co/calculator";
import { getCountryCalculator } from "@/lib/countries/registry";
import type { COCalculatorInputs } from "@/lib/countries/co/types";
import { clampAmount } from "@/lib/utils";

export default function COCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<COCalculatorInputs>(country);
  const combinedLimit = getColombiaVoluntaryCombinedLimit(inputs.grossSalary);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);

  const setAfc = (afcSavings: number) => {
    const cappedAfc = clampAmount(afcSavings, combinedLimit);
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        afcSavings: cappedAfc,
        voluntaryPension: clampAmount(
          current.contributions.voluntaryPension,
          Math.max(0, combinedLimit - cappedAfc),
        ),
      },
    }));
  };

  const setVoluntaryPension = (voluntaryPension: number) => {
    const cappedPension = clampAmount(
      voluntaryPension,
      Math.max(0, combinedLimit - inputs.contributions.afcSavings),
    );
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        voluntaryPension: cappedPension,
        afcSavings: clampAmount(
          current.contributions.afcSavings,
          Math.max(0, combinedLimit - cappedPension),
        ),
      },
    }));
  };

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
            id="co-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="AFC housing savings"
            description={`Exempt income sharing combined cap (${limits.afcSavings?.description ?? ""})`}
            value={inputs.contributions.afcSavings}
            onChange={setAfc}
            max={combinedLimit}
            step={500_000}
            currency={currency}
          />
          <ContributionSlider
            label="Voluntary pension"
            description="Private pension contributions share the same 30% / 3,800 UVT combined cap with AFC."
            value={inputs.contributions.voluntaryPension}
            onChange={setVoluntaryPension}
            max={combinedLimit}
            step={500_000}
            currency={currency}
          />
        </div>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Mandatory 9% parafiscales; AFC + voluntary pension exempt within combined
          cap; UVT withholding table.
        </InfoPanel>
      }
      seoInfo={<ColombiaTaxInfo />}
    />
  );
}

function ColombiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Colombia</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Parafiscales</strong> – pension,
            health, solidarity (9% employee).
          </li>
          <li>
            <strong className="text-zinc-300">AFC + voluntary pension</strong> –
            exempt up to 30% of income and 3,800 UVT combined.
          </li>
        </ul>
      </div>
    </section>
  );
}
