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
import { NG_SOURCE_URLS } from "@/lib/countries/ng/constants/tax-year-2026";
import type { NGCalculatorInputs } from "@/lib/countries/ng/types";
import { clampAmount } from "@/lib/utils";

export default function NGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<NGCalculatorInputs>(country);
  const limit =
    getCountryCalculator(country).getContributionLimits(inputs)
      .additionalVoluntaryPension?.limit ?? 0;

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
            id="ng-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Additional voluntary pension (AVC)"
          description="Extra pension contributions under the Pension Reform Act, deductible before PAYE (on top of the mandatory 8%)."
          value={inputs.contributions.additionalVoluntaryPension}
          onChange={(additionalVoluntaryPension) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                additionalVoluntaryPension: clampAmount(
                  additionalVoluntaryPension,
                  limit,
                ),
              },
            }))
          }
          max={limit}
          step={50_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Mandatory 8% pension plus optional AVC before NTA 2025 PAYE. Rent
          relief, NHF, and life insurance excluded.
        </InfoPanel>
      }
      seoInfo={<NigeriaTaxInfo />}
    />
  );
}

function NigeriaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Nigeria</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Pension</strong> – mandatory 8%
            employee contribution deducted from gross before tax.
          </li>
          <li>
            <strong className="text-zinc-300">AVC</strong> – additional
            voluntary pension deductible under NTA 2025 §30(2)(a)(iii).
          </li>
          <li>
            <strong className="text-zinc-300">PAYE</strong> – NTA 2025
            progressive rates from 0% to 25% on chargeable income.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 mt-4">
          Source:{" "}
          <a
            href={NG_SOURCE_URLS.pension}
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            National Pension Commission (PenCom)
          </a>
        </p>
      </div>
    </section>
  );
}
