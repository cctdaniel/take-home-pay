"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  type CountryCalculatorExtensionProps,
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import {
  MEXICO_STATES,
  MEXICO_VOLUNTARY_RETIREMENT_2026,
} from "@/lib/countries/mx/constants/tax-year-2026";
import type { MXCalculatorInputs } from "@/lib/countries/mx/types";
import type { MexicoStateCode } from "@/lib/countries/mx/constants/tax-year-2026";
import { formatCurrency } from "@/lib/format";

function getRetirementLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * MEXICO_VOLUNTARY_RETIREMENT_2026.deductionRateLimit,
    MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
  );
}

export default function MXCountryExtension({ country }: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<MXCalculatorInputs>(country);
  const retirementLimit = getRetirementLimit(inputs.grossSalary);

  const updateInputs = (updater: (current: MXCalculatorInputs) => MXCalculatorInputs) => {
    setInputs((current) => {
      const next = updater(current);
      const nextLimit = getRetirementLimit(next.grossSalary);
      return {
        ...next,
        contributions: {
          voluntaryRetirementContribution: Math.min(
            Math.max(0, next.contributions.voluntaryRetirementContribution),
            nextLimit,
          ),
        },
      };
    });
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        updateInputs((current) => ({ ...current, grossSalary }))
      }
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField<MexicoStateCode>
            id="mx-state"
            label="State"
            value={inputs.state}
            onChange={(state) =>
              updateInputs((current) => ({ ...current, state }))
            }
            options={MEXICO_STATES.map((state) => ({
              value: state.code,
              label: state.name,
            }))}
            description="State payroll taxes are employer-side, so this is informational for employee take-home."
          />
          <PayFrequencyField
            id="mx-pay-frequency"
            value={inputs.payFrequency}
            onChange={(payFrequency) =>
              updateInputs((current) => ({ ...current, payFrequency }))
            }
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary Retirement Savings"
          description="Modeled as a personal deduction, capped at 10% of gross income and the modeled annual cap."
          value={inputs.contributions.voluntaryRetirementContribution}
          onChange={(voluntaryRetirementContribution) =>
            updateInputs((current) => ({
              ...current,
              contributions: { voluntaryRetirementContribution },
            }))
          }
          max={retirementLimit}
          step={500}
          currency={currency}
        />
      }
      contributionsTitle="Retirement Contributions"
      contributionsDescription="Modeled Mexico voluntary retirement deduction"
      infoCard={
        <InfoPanel title="Modeled Scope">
          Uses the 2026 annual ISR tariff, employee IMSS branches with SBC capped
          at 25x UMA, and voluntary retirement savings capped at {formatCurrency(
            MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
            currency,
          )} or 10% of gross income. State ISN payroll taxes are employer-side and
          do not reduce modeled employee take-home pay.
        </InfoPanel>
      }
      seoInfo={
        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Mexico salary after tax calculator</h2>
          <p>
            Estimate Mexico take-home pay using the annual ISR tariff, employee-side
            IMSS contributions, optional voluntary retirement savings, and state context
            for employer-side payroll tax notes.
          </p>
        </section>
      }
    />
  );
}
