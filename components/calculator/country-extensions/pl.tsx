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
import type { PLCalculatorInputs } from "@/lib/countries/pl/types";
import { clampAmount } from "@/lib/utils";

export default function PLCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<PLCalculatorInputs>(country);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);
  const ikzeLimit = limits.ikze?.limit ?? 0;
  const ppkAdditionalLimit = limits.ppkAdditional?.limit ?? 0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <CountStepperField
            spanColumns={2}
            id="pl-children"
            label="Children (tax credit)"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({ ...current, numberOfChildren }))
            }
            min={0}
            max={10}
          />
          <PayFrequencyField
            id="pl-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <>
          <ContributionSlider
            label="IKZE"
            description="Individual retirement account deposit up to PLN 10,512 in 2026; reduces PIT base."
            value={inputs.contributions.ikze}
            onChange={(ikze) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  ikze: clampAmount(ikze, ikzeLimit),
                },
              }))
            }
            max={ikzeLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="PPK additional employee"
            description="Additional PPK employee contribution up to 4% of gross; reduces PIT base and net."
            value={inputs.contributions.ppkAdditional}
            onChange={(ppkAdditional) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  ppkAdditional: clampAmount(ppkAdditional, ppkAdditionalLimit),
                },
              }))
            }
            max={ppkAdditionalLimit}
            step={100}
            currency={currency}
          />
        </>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      seoInfo={<PolandTaxInfo />}
      hideDefaultSeoTaxInfo
      infoCard={
        <InfoPanel title="Modeled scope">
          PIT scale 12%/32%, PLN 30,000 tax-free amount, ZUS ~13.71%,
          9% health insurance deductible from PIT base, plus optional IKZE and PPK.
        </InfoPanel>
      }
    />
  );
}

function PolandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Poland</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">ZUS</strong> – employee social
            insurance modeled at 13.71% of gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Health insurance</strong> – 9% on
            gross minus ZUS, deductible from the income tax base.
          </li>
          <li>
            <strong className="text-zinc-300">PIT</strong> – 12% up to PLN
            120,000 taxable and 32% above, with PLN 30,000 tax-free modeled as a
            credit.
          </li>
          <li>
            <strong className="text-zinc-300">IKZE / PPK</strong> – voluntary
            contributions reduce the PIT base and net salary.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Sources:{" "}
          <a
            href="https://www.gov.pl/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            gov.pl
          </a>
          ,{" "}
          <a
            href="https://www.zus.pl/"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ZUS
          </a>
        </p>
      </div>
    </section>
  );
}
