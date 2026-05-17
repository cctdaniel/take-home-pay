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
  MEXICO_PERSONAL_DEDUCTIONS_2026,
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

function getGeneralDeductionLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * MEXICO_PERSONAL_DEDUCTIONS_2026.generalDeductionRateLimit,
    MEXICO_PERSONAL_DEDUCTIONS_2026.modeledGeneralDeductionCap,
  );
}

export default function MXCountryExtension({ country }: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<MXCalculatorInputs>(country);
  const retirementLimit = getRetirementLimit(inputs.grossSalary);
  const generalDeductionLimit = getGeneralDeductionLimit(inputs.grossSalary);

  const updateInputs = (updater: (current: MXCalculatorInputs) => MXCalculatorInputs) => {
    setInputs((current) => {
      const next = updater(current);
      const nextRetirementLimit = getRetirementLimit(next.grossSalary);
      const nextGeneralDeductionLimit = getGeneralDeductionLimit(next.grossSalary);
      return {
        ...next,
        contributions: {
          voluntaryRetirementContribution: Math.min(
            Math.max(0, next.contributions.voluntaryRetirementContribution),
            nextRetirementLimit,
          ),
          medicalDentalExpenses: Math.min(
            Math.max(0, next.contributions.medicalDentalExpenses),
            nextGeneralDeductionLimit,
          ),
          funeralExpenses: Math.min(
            Math.max(0, next.contributions.funeralExpenses),
            nextGeneralDeductionLimit,
          ),
          mortgageInterest: Math.min(
            Math.max(0, next.contributions.mortgageInterest),
            nextGeneralDeductionLimit,
          ),
          educationExpenses: Math.min(
            Math.max(0, next.contributions.educationExpenses),
            MEXICO_PERSONAL_DEDUCTIONS_2026.educationDeductionCap,
          ),
        },
      };
    });
  };

  const updateContribution = (
    key: keyof MXCalculatorInputs["contributions"],
    value: number,
  ) => {
    updateInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: value,
      },
    }));
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
        <div className="space-y-6">
          <ContributionSlider
            label="AFORE / Voluntary Retirement"
            description="Modeled as a personal deduction, capped at 10% of gross income and the modeled annual cap."
            value={inputs.contributions.voluntaryRetirementContribution}
            onChange={(value) => updateContribution("voluntaryRetirementContribution", value)}
            max={retirementLimit}
            step={500}
            currency={currency}
          />
          <ContributionSlider
            label="Medical & Dental Expenses"
            description="Modeled personal deduction subject to the annual personal deduction cap."
            value={inputs.contributions.medicalDentalExpenses}
            onChange={(value) => updateContribution("medicalDentalExpenses", value)}
            max={generalDeductionLimit}
            step={500}
            currency={currency}
          />
          <ContributionSlider
            label="Funeral Expenses"
            description="Modeled personal deduction subject to the annual personal deduction cap."
            value={inputs.contributions.funeralExpenses}
            onChange={(value) => updateContribution("funeralExpenses", value)}
            max={generalDeductionLimit}
            step={500}
            currency={currency}
          />
          <ContributionSlider
            label="Mortgage Interest"
            description="Modeled deductible real mortgage interest subject to the annual personal deduction cap."
            value={inputs.contributions.mortgageInterest}
            onChange={(value) => updateContribution("mortgageInterest", value)}
            max={generalDeductionLimit}
            step={500}
            currency={currency}
          />
          <ContributionSlider
            label="Education Expenses"
            description="Modeled tuition/education deduction cap."
            value={inputs.contributions.educationExpenses}
            onChange={(value) => updateContribution("educationExpenses", value)}
            max={MEXICO_PERSONAL_DEDUCTIONS_2026.educationDeductionCap}
            step={500}
            currency={currency}
          />
        </div>
      }
      contributionsTitle="Retirement, Benefits & Deductions"
      contributionsDescription="AFORE, medical, funeral, mortgage, and education deductions"
      infoCard={
        <InfoPanel title="Modeled Scope">
          Uses the 2026 annual ISR tariff, employee IMSS branches with SBC capped
          at 25x UMA, and deductions capped at {formatCurrency(
            MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
            currency,
          )} for modeled retirement and {formatCurrency(generalDeductionLimit, currency)}
          for general personal deductions. State ISN payroll taxes are employer-side.
        </InfoPanel>
      }
      seoInfo={
        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Mexico salary after tax calculator</h2>
          <p>
            Estimate Mexico take-home pay using ISR, employee-side IMSS, AFORE or
            voluntary retirement savings, medical and dental, funeral, mortgage-interest,
            education deductions, and state context for employer-side payroll tax notes.
          </p>
        </section>
      }
    />
  );
}
