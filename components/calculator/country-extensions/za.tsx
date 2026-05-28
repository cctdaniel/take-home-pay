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
import { ZA_RETIREMENT_ANNUITY_2026 } from "@/lib/countries/za/constants/tax-year-2026";
import type { ZACalculatorInputs } from "@/lib/countries/za/types";
import { clampAmount, clampCount } from "@/lib/utils";

function getRaLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * ZA_RETIREMENT_ANNUITY_2026.contributionRateLimit,
    ZA_RETIREMENT_ANNUITY_2026.annualDollarLimit,
  );
}

export default function ZACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setPayFrequency } =
    useCountryCalculatorExtension<ZACalculatorInputs>(country);
  const raLimit = getRaLimit(inputs.grossSalary);
  const limits = getCountryCalculator(country).getContributionLimits(inputs);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        setInputs((current) => ({
          ...current,
          grossSalary,
          contributions: {
            retirementAnnuity: clampAmount(
              current.contributions.retirementAnnuity,
              getRaLimit(grossSalary),
            ),
          },
        }))
      }
      result={result}
      hideDefaultSeoTaxInfo
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="za-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CountStepperField
            spanColumns={2}
            id="za-medical-dependents"
            label="Medical aid dependents"
            value={inputs.medicalDependents}
            onChange={(medicalDependents) =>
              setInputs((current) => ({
                ...current,
                medicalDependents: clampCount(medicalDependents, 8),
              }))
            }
            max={8}
            description="R246/month credit per additional dependent."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Retirement annuity"
          description="Pre-tax RA up to 27.5% of income, max R350,000."
          value={inputs.contributions.retirementAnnuity}
          onChange={(retirementAnnuity) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                retirementAnnuity: clampAmount(retirementAnnuity, raLimit),
              },
            }))
          }
          max={limits.retirementAnnuity?.limit ?? raLimit}
          step={500}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust your retirement and savings contributions"
      infoCard={
        <InfoPanel title="Modeled Scope">
          PAYE 2025/26 with primary rebate, UIF 1% cap, medical credits, and RA
          deduction.
        </InfoPanel>
      }
      seoInfo={<SouthAfricaTaxInfo />}
    />
  );
}

function SouthAfricaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          South Africa
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">PAYE</strong> – 18–45% slices with
            primary rebate R17,235.
          </li>
          <li>
            <strong className="text-zinc-300">UIF</strong> – 1% employee, max
            R17,712/year.
          </li>
          <li>
            <strong className="text-zinc-300">Medical credits</strong> – R364
            main member + R246 per dependent per month.
          </li>
          <li>
            <strong className="text-zinc-300">RA</strong> – deductible
            contribution up to 27.5% of income (max R350k).
          </li>
        </ul>
      </div>
    </section>
  );
}
