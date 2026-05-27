"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import {
  SE_AVERAGE_MUNICIPAL_TAX_RATE_2026,
  SE_COMMUTING_DEDUCTION_THRESHOLD_2026,
  SE_EXPERT_RELIEF_2026_MIN_MONTHLY,
  SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026,
  SE_OTHER_WORK_EXPENSE_THRESHOLD_2026,
  SE_PRIVATE_PENSION_DEDUCTION_2026,
  SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026,
} from "@/lib/countries/se/constants/tax-year-2026";
import type {
  SECalculatorInputs,
  SEContributionInputs,
  SETaxRegime,
} from "@/lib/countries/se/types";

const SE_TAX_REGIME_OPTIONS: Array<{
  value: SETaxRegime;
  label: string;
}> = [
  { value: "ordinary", label: "Ordinary resident salary" },
  { value: "expertRelief", label: "Expert tax relief" },
];

function clamp(value: number, max = Infinity, min = 0) {
  return Math.min(Math.max(min, value), max);
}

export default function SECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<SECalculatorInputs>(country);
  const isExpertRelief = inputs.taxRegime === "expertRelief";
  const privatePensionLimit = Math.min(
    Math.round(inputs.grossSalary * SE_PRIVATE_PENSION_DEDUCTION_2026.rate),
    SE_PRIVATE_PENSION_DEDUCTION_2026.max,
  );
  const updateContribution = (
    key: keyof SEContributionInputs,
    value: number,
    max = Infinity,
  ) =>
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clamp(value, max),
      },
    }));

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="se-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="se-tax-regime"
            label="Tax Regime"
            value={inputs.taxRegime}
            onChange={(taxRegime) =>
              setInputs((current) => ({ ...current, taxRegime }))
            }
            options={SE_TAX_REGIME_OPTIONS}
            description="Use only after a positive decision from the Taxation of Research Workers Board."
          />
          {!isExpertRelief && (
            <>
              <NumberField
                id="se-municipal-tax-rate"
                label="Municipal Tax Rate (%)"
                value={Math.round(inputs.municipalTaxRate * 10_000) / 100}
                onChange={(municipalTaxRate) =>
                  setInputs((current) => ({
                    ...current,
                    municipalTaxRate: clamp(municipalTaxRate, 40, 20) / 100,
                  }))
                }
                min={20}
                max={40}
                step={0.01}
                fallbackValue={SE_AVERAGE_MUNICIPAL_TAX_RATE_2026 * 100}
                description="Use your municipality/region rate from the tax table; default is the modeled average."
              />
              <BooleanSelectField
                id="se-no-occupational-pension"
                label="No Occupational Pension"
                value={inputs.noOccupationalPension}
                onChange={(noOccupationalPension) =>
                  setInputs((current) => ({
                    ...current,
                    noOccupationalPension,
                    contributions: {
                      ...current.contributions,
                      privatePensionSavings: noOccupationalPension
                        ? current.contributions.privatePensionSavings
                        : 0,
                    },
                  }))
                }
                trueLabel="No occupational pension"
                falseLabel="Has occupational pension"
                description="Private pension savings are deductible only when you completely lack occupational pension rights in employment."
              />
            </>
          )}
        </CalculatorFieldGrid>
      }
      contributionsTitle="Sweden Deductions and Tax Reductions"
      contributionsDescription={
        isExpertRelief
          ? "Ordinary deductions are not applied to expert-relief exempt salary"
          : "Swedish deductions and tax reductions that can affect final take-home pay"
      }
      contributions={
        !isExpertRelief ? (
          <div className="space-y-6">
            {inputs.noOccupationalPension && (
              <ContributionSlider
                label="Private pension savings"
                value={inputs.contributions.privatePensionSavings}
                onChange={(value) =>
                  updateContribution(
                    "privatePensionSavings",
                    value,
                    privatePensionLimit,
                  )
                }
                max={privatePensionLimit}
                step={1_000}
                currency={currency}
                description="Deductible only when employment has no occupational pension rights; capped at 35% of salary and SEK 592,000 for 2026."
              />
            )}
            <CurrencyAmountField
              id="se-commuting-expenses"
              label="Commuting Expenses"
              value={inputs.contributions.commutingExpenses}
              onChange={(value) => updateContribution("commutingExpenses", value)}
              currency={currency}
              step={500}
              description={`Only expenses above SEK ${SE_COMMUTING_DEDUCTION_THRESHOLD_2026.toLocaleString()} are deductible for income year 2026.`}
            />
            <CurrencyAmountField
              id="se-other-work-expenses"
              label="Other Work Expenses"
              value={inputs.contributions.otherWorkExpenses}
              onChange={(value) => updateContribution("otherWorkExpenses", value)}
              currency={currency}
              step={500}
              description={`Protective equipment, work phone calls, literature, and similar expenses are deductible only above SEK ${SE_OTHER_WORK_EXPENSE_THRESHOLD_2026.toLocaleString()}.`}
            />
            <ContributionSlider
              label="ROT/RUT tax reduction"
              value={inputs.contributions.rotRutTaxReduction}
              onChange={(value) =>
                updateContribution(
                  "rotRutTaxReduction",
                  value,
                  SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026,
                )
              }
              max={SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026}
              step={1_000}
              currency={currency}
              description="Enter the expected final tax reduction, not the invoice amount. ROT/RUT together are capped at SEK 75,000 per person; ROT is capped within that."
            />
            <ContributionSlider
              label="Green technology tax reduction"
              value={inputs.contributions.greenTechnologyTaxReduction}
              onChange={(value) =>
                updateContribution(
                  "greenTechnologyTaxReduction",
                  value,
                  SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026,
                )
              }
              max={SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026}
              step={1_000}
              currency={currency}
              description="Enter the expected final green-technology tax reduction for solar, battery, or EV charging installation."
            />
          </div>
        ) : undefined
      }
      contributionsEmptyState="Expert tax relief taxes only the modeled taxable salary share. Ordinary private pension, commuting, work-expense, ROT/RUT, and green-technology reductions are not applied to the exempt salary treatment and require separate ordinary-tax facts."
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Sweden employment salary for a full tax year
            or the selected expert tax relief treatment.
          </p>
          <p className="mt-2">
            Expert tax relief exempts 25% of salary from income tax in this
            salary model. The 2026 remuneration route requires monthly pay of
            at least SEK {SE_EXPERT_RELIEF_2026_MIN_MONTHLY.toLocaleString()},
            while experts, researchers, and key people can qualify through a
            separate decision.
          </p>
          <p className="mt-2">
            Ordinary mode includes a municipal tax-rate input plus explicit
            controls for private pension savings when no occupational pension is
            available, commuting expenses, other work expenses, ROT/RUT tax
            reduction, and green-technology tax reduction. Church and burial
            fees, exact basic allowance and job tax credit formulas, benefits,
            and employer occupational pension design need taxpayer-specific
            facts and are not hidden inputs.
          </p>
        </InfoPanel>
      }
      seoInfo={<SwedenTaxInfo />}
    />
  );
}

function SwedenTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Sweden Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            selected municipal tax rate, the 2026 state income tax threshold,
            the modeled basic allowance proxy, and the general pension
            contribution tax reduction.
          </li>
          <li>
            <strong className="text-zinc-300">Private Pension Savings</strong>{" "}
            are deductible only when the employee completely lacks occupational
            pension rights in employment.
          </li>
          <li>
            <strong className="text-zinc-300">Commuting and Work Expenses</strong>{" "}
            reduce taxable income only above the Skatteverket thresholds for
            income year 2026.
          </li>
          <li>
            <strong className="text-zinc-300">ROT/RUT and Green Technology</strong>{" "}
            are modeled as final tax reductions, capped to the published
            per-person annual limits and limited by available income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Expert Tax Relief</strong> exempts
            25% of salary in this salary model after a qualifying decision.
          </li>
        </ul>
      </div>
    </section>
  );
}
