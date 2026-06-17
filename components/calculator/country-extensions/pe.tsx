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
import { PE_SOURCE_URLS } from "@/lib/countries/pe/constants/tax-year-2026";
import type { PECalculatorInputs } from "@/lib/countries/pe/types";
import { clampAmount } from "@/lib/utils";

export default function PECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<PECalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs).apv?.limit ?? 0;

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
            id="pe-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="AFP voluntary contribution (APV)"
          description="Tax-deductible voluntary pension up to 8% of gross income or 41 UIT per year."
          value={inputs.contributions.apv}
          onChange={(apv) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                apv: clampAmount(apv, limit),
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
          13% mandatory pension; 7 UIT deduction; APV reduces PIT base; progressive
          fifth-category rates 8%–30%.
        </InfoPanel>
      }
      seoInfo={<PeruTaxInfo />}
    />
  );
}

function PeruTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Peru</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Pension</strong> – ~13% employee
            contribution on gross (ONP/AFP blended).
          </li>
          <li>
            <strong className="text-zinc-300">APV</strong> – voluntary AFP
            contributions deductible up to 8% of gross or 41 UIT.
          </li>
          <li>
            <strong className="text-zinc-300">Income tax</strong> – progressive
            fifth-category rates after 7 UIT deduction and APV.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={PE_SOURCE_URLS.sunat}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SUNAT
          </a>
        </p>
      </div>
    </section>
  );
}
