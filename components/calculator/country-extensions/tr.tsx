"use client";

import { PayFrequencyField } from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026 } from "@/lib/countries/tr/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import type { TRCalculatorInputs } from "@/lib/countries/tr/types";
import { formatCurrency } from "@/lib/format";
import { clampAmount } from "@/lib/utils";

export default function TRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<TRCalculatorInputs>(country);
  const privatePensionLimit =
    getCountryCalculator(country).getContributionLimits(inputs).privatePension
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
        <PayFrequencyField
          id="tr-pay-frequency"
          value={inputs.payFrequency}
          onChange={setPayFrequency}
        />
      }
      contributions={
        <ContributionSlider
          label="BES private pension"
          description="Employee BES contribution up to 3% of gross; income tax credit 30% of contribution capped at tax due."
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
          step={500}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          GVK income tax after minimum-wage exemption (
          {formatCurrency(TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026, currency)}{" "}
          annual exemption), capped SGK 14% and unemployment 1%, plus optional BES with
          30% tax credit.
        </InfoPanel>
      }
      seoInfo={<TurkeyTaxInfo />}
    />
  );
}

function TurkeyTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Turkey</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – GVK
            progressive 15–40% on taxable income after minimum-wage exemption.
          </li>
          <li>
            <strong className="text-zinc-300">BES</strong> – up to 3% of gross;
            30% of contribution credited against income tax (capped at tax due).
          </li>
          <li>
            <strong className="text-zinc-300">SGK</strong> – 14% employee on
            capped insurable earnings.
          </li>
        </ul>
      </div>
    </section>
  );
}
