"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
  type SelectOption,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  getSerbiaNewlySettledReliefThreshold,
  isSerbiaNewlySettledReliefApplicable,
} from "@/lib/countries/rs/constants/tax-year-2026";
import { formatCurrency } from "@/lib/format";
import type {
  RSCalculatorInputs,
  RSNewlySettledRelief,
} from "@/lib/countries/rs/types";

const NEWLY_SETTLED_RELIEF_OPTIONS: SelectOption<RSNewlySettledRelief>[] = [
  { value: "none", label: "Not eligible" },
  { value: "prior_nonresident", label: "24-month non-resident" },
  { value: "under40_education", label: "Under-40 education/training" },
];

export default function RSCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<RSCalculatorInputs>(country);
  const newlySettledThreshold = getSerbiaNewlySettledReliefThreshold(inputs);
  const newlySettledReliefApplies =
    isSerbiaNewlySettledReliefApplicable(inputs);
  const monthlyCashSalary = Math.max(0, inputs.grossSalary) / 12;

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
            id="rs-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="rs-taxable-fringe-benefits"
            label="Taxable Fringe Benefits"
            value={inputs.taxableFringeBenefits}
            onChange={(taxableFringeBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableFringeBenefits: Math.max(0, taxableFringeBenefits),
                taxableNonCashBenefits: Math.max(0, taxableFringeBenefits),
              }))
            }
            currency={currency}
            description="Annual taxable value of Serbian salary-like benefits, vouchers, goods, or covered employee expenses. It raises tax/contribution bases but is not cash salary."
          />
          <BooleanSelectField
            id="rs-include-annual-pit"
            label="Annual PIT Estimate"
            value={inputs.includeAnnualPersonalIncomeTax}
            onChange={(includeAnnualPersonalIncomeTax) =>
              setInputs((current) => ({
                ...current,
                includeAnnualPersonalIncomeTax,
              }))
            }
            trueLabel="Include"
            falseLabel="Payroll only"
            trueFirst
            description="Adds Serbia's supplementary annual personal income tax on salary-only income when thresholds apply."
          />
          <SelectField
            id="rs-newly-settled-relief"
            label="Newly Settled Taxpayer Relief"
            value={inputs.newlySettledRelief}
            onChange={(newlySettledRelief) =>
              setInputs((current) => ({
                ...current,
                newlySettledRelief,
              }))
            }
            options={NEWLY_SETTLED_RELIEF_OPTIONS}
            description={
              newlySettledThreshold === null
                ? "For qualifying relocations and returnees, Serbia can reduce the salary-tax and compulsory-social-security bases by 70% for five years."
                : newlySettledReliefApplies
                  ? `Applies the 70% base reduction. The selected category's 2026 monthly cash salary threshold is ${formatCurrency(newlySettledThreshold, currency)}.`
                  : `No reduction is applied until monthly cash salary exceeds ${formatCurrency(newlySettledThreshold, currency)} for the selected 2026 category. Current monthly cash salary is ${formatCurrency(monthlyCashSalary, currency)}.`
            }
          />
          <NumberField
            id="rs-age"
            label="Age on Dec 31"
            value={inputs.age}
            onChange={(age) =>
              setInputs((current) => ({
                ...current,
                age,
              }))
            }
            min={18}
            max={100}
            fallbackValue={35}
            description="Under-40 taxpayers can reduce annual taxable income by the official annual threshold."
          />
          <NumberStepperField
            id="rs-dependents"
            label="Annual-Tax Dependents"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfDependents,
              }))
            }
            min={0}
            max={10}
            description="Dependent-family-member deduction for the supplementary annual tax."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        inputs.includeAnnualPersonalIncomeTax ? (
          <CurrencyAmountField
            id="rs-aif-investment"
            label="Alternative Investment Fund Investment"
            value={inputs.contributions.qualifyingExpenses ?? 0}
            onChange={(qualifyingExpenses) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  qualifyingExpenses: Math.max(0, qualifyingExpenses),
                },
              }))
            }
            currency={currency}
            description="Cash contributions acquiring shares or units in an alternative investment fund; credit is limited inside the annual PIT calculation."
          />
        ) : null
      }
      contributionsTitle="Annual Tax Credits"
      contributionsDescription="Optional items that reduce the supplementary annual personal income tax"
      contributionsEmptyState={
        inputs.includeAnnualPersonalIncomeTax
          ? undefined
          : "Turn on Annual PIT Estimate above to enter the alternative-investment-fund credit. Ordinary monthly salary payroll has no separate employee-controlled retirement relief slider in this model; AIF credit claims require separate annual PIT facts."
      }
      seoInfo={<SerbiaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Serbia salary tax at the flat 10% rate after the 2026
            non-taxable salary amount, plus employee pension, health, and
            unemployment contributions with the 2026 contribution base limits.
          </p>
          <p className="mt-2">
            The supplementary annual personal income tax is modeled as a
            salary-only year-end estimate using the latest official annual-return
            parameters published for the 2026 filing season. The age, dependant,
            and alternative-investment-fund fields only affect that annual tax
            estimate. Taxable fringe benefits can be entered as annual
            salary-like non-cash earnings.
          </p>
          <p className="mt-2">
            The newly settled taxpayer selector models Serbia&apos;s five-year 70%
            base reduction for qualifying relocations or returnees only when
            the selected 2026 monthly cash salary threshold is exceeded.
          </p>
          <p className="mt-2">
            Employer-side social contributions, other annual-income categories,
            foreign tax credits, contribution-refund adjustments,
            founder/startup and other employer-side hiring incentives, taxable
            fringe-benefit valuation worksheets, and self-employment or
            freelance regimes are not modeled as ordinary salary inputs.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SerbiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Serbia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Salary Tax</strong> applies at
            10% after the annualized RSD 34,221 monthly non-taxable salary
            amount.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Contributions</strong>{" "}
            model pension/disability, health, and unemployment at 14%, 5.15%,
            and 0.75%.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Fringe Benefits</strong>{" "}
            add the entered salary-like non-cash value to salary tax and social
            contribution bases, while cash take-home still starts from salary.
          </li>
          <li>
            <strong className="text-zinc-300">Contribution Bases</strong> use
            the 2026 monthly minimum and maximum bases for ordinary payroll.
          </li>
          <li>
            <strong className="text-zinc-300">Newly Settled Relief</strong>{" "}
            can reduce the salary-tax and employee social-security bases by
            70% when the selected relocation category, qualified-employer,
            residency, salary-threshold, and five-year conditions are met.
          </li>
          <li>
            <strong className="text-zinc-300">Supplementary Annual Tax</strong>{" "}
            can be included as a separate salary-only estimate with the
            under-40 reduction, dependent deductions, and selected
            alternative-investment-fund credit.
          </li>
        </ul>
      </div>
    </section>
  );
}
