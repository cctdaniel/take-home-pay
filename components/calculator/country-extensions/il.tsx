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
import type { ILCalculatorInputs } from "@/lib/countries/il/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function ILCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<ILCalculatorInputs>(country);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);
  const studyFundLimit = limits.studyFund?.limit ?? 0;
  const supplementalPensionLimit = limits.supplementalPension?.limit ?? 0;

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
          <BooleanSelectField
            id="il-married"
            label="Married"
            value={inputs.isMarried}
            onChange={(isMarried) =>
              setInputs((current) => ({ ...current, isMarried }))
            }
            trueLabel="Married"
            falseLabel="Single"
            description="Adds 0.5 credit points when married."
          />
          <PayFrequencyField
            id="il-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CountStepperField
            spanColumns={2}
            id="il-children-under-6"
            label="Children under 6"
            value={inputs.childrenUnder6}
            onChange={(childrenUnder6) =>
              setInputs((current) => ({
                ...current,
                childrenUnder6: clampCount(childrenUnder6, 8),
              }))
            }
            max={8}
          />
          <CountStepperField
            spanColumns={2}
            id="il-children-6-17"
            label="Children 6–17"
            value={inputs.children6To17}
            onChange={(children6To17) =>
              setInputs((current) => ({
                ...current,
                children6To17: clampCount(children6To17, 8),
              }))
            }
            max={8}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <>
          <ContributionSlider
            label="Study fund (Keren Hishtalmut)"
            description="Employee study fund contribution up to 7.5% of gross annual salary."
            value={inputs.contributions.studyFund}
            onChange={(studyFund) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  studyFund: clampAmount(studyFund, studyFundLimit),
                },
              }))
            }
            max={studyFundLimit}
            step={500}
            currency={currency}
          />
          <ContributionSlider
            label="Supplemental pension"
            description="Additional employee pension up to 5% of gross; reduces Mas Hachnasa taxable income."
            value={inputs.contributions.supplementalPension}
            onChange={(supplementalPension) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  supplementalPension: clampAmount(
                    supplementalPension,
                    supplementalPensionLimit,
                  ),
                },
              }))
            }
            max={supplementalPensionLimit}
            step={500}
            currency={currency}
          />
        </>
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Progressive income tax with credit points, Bituach Leumi, health
          insurance, and mandatory 6% pension. Optional study fund and supplemental
          pension modeled per caps above.
        </InfoPanel>
      }
      seoInfo={<IsraelTaxInfo />}
    />
  );
}

function IsraelTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Israel</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income tax</strong> – 10% to 50%
            on annual taxable salary after credit points.
          </li>
          <li>
            <strong className="text-zinc-300">Credit points</strong> – base 2.25,
            +1 child under 6, +0.5 child 6–17, +0.5 if married.
          </li>
          <li>
            <strong className="text-zinc-300">Social</strong> – Bituach Leumi
            3.5% (capped), health 3.1%, mandatory pension 6% (capped).
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary</strong> – supplemental
            pension reduces Mas Hachnasa; study fund deducted from net.
          </li>
        </ul>
      </div>
    </section>
  );
}
