"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
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
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  PY_AGUINALDO_MONTHS,
  PY_IPS_EMPLOYEE_RATE,
  PY_IRP_GROSS_INCOME_THRESHOLD,
} from "@/lib/countries/py/constants/tax-year-2026";
import type {
  PYAguinaldoMode,
  PYCalculatorInputs,
  PYContributionInputs,
} from "@/lib/countries/py/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

const PY_AGUINALDO_OPTIONS = [
  {
    value: "includedInGross",
    label: "Included in gross",
  },
  {
    value: "additionalToGross",
    label: "Add statutory aguinaldo",
  },
  {
    value: "none",
    label: "Not paid / exclude",
  },
] satisfies Array<{ value: PYAguinaldoMode; label: string }>;

export default function PYCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<PYCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const deductibleExpenseLimit =
    contributionLimits.qualifyingExpenses?.limit ?? 0;

  const setContribution = (
    key: keyof PYContributionInputs,
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
      },
    }));
  };

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
            id="py-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="py-aguinaldo"
            label="Aguinaldo Treatment"
            value={inputs.aguinaldoMode}
            onChange={(aguinaldoMode) =>
              setInputs((current) => ({ ...current, aguinaldoMode }))
            }
            options={PY_AGUINALDO_OPTIONS}
            description="Models the legal aguinaldo as one-twelfth of ordinary salary, excluded from IRP and IPS."
          />
          <BooleanSelectField
            id="py-ips-covered"
            label="IPS Employee Coverage"
            value={inputs.ipsCovered}
            onChange={(ipsCovered) =>
              setInputs((current) => {
                const nextInputs = { ...current, ipsCovered };
                const limit = getCountryCalculator(country).getContributionLimits(
                  nextInputs,
                ).qualifyingExpenses?.limit ?? 0;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    qualifyingExpenses: clampAmount(
                      current.contributions.qualifyingExpenses ?? 0,
                      limit,
                    ),
                  },
                };
              })
            }
            trueLabel="Private-sector IPS"
            falseLabel="No IPS payroll deduction"
            trueFirst
            description="Ordinary private-sector employees contribute 9%; public-sector or independent regimes need separate worker-type inputs."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        deductibleExpenseLimit > 0 ? (
          <ContributionSlider
            label={contributionLimits.qualifyingExpenses.name}
            value={Math.min(
              inputs.contributions.qualifyingExpenses ?? 0,
              deductibleExpenseLimit,
            )}
            onChange={(amount) =>
              setContribution("qualifyingExpenses", amount)
            }
            max={deductibleExpenseLimit}
            step={Math.max(100000, Math.round(deductibleExpenseLimit / 100))}
            currency={currency}
            description={contributionLimits.qualifyingExpenses.description}
          />
        ) : undefined
      }
      contributionsTitle="IRP Deductible Expenses"
      contributionsDescription="Documented personal and family expenses that reduce Paraguay IRP taxable income when the annual threshold is exceeded"
      seoInfo={<ParaguayTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Paraguay resident employment income under IRP-RSP for
            personal services, with IRP activated only when annual gross
            personal-service income exceeds PYG{" "}
            {PY_IRP_GROSS_INCOME_THRESHOLD.toLocaleString()}.
          </p>
          <p className="mt-2">
            The deductible-expense slider is for DNIT-supported documented
            personal and family expenses. VAT credit mechanics, invoice
            validation, independent-provider private social security, and
            special public-sector pension systems are not included. Legal
            aguinaldo is modeled separately when selected.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ParaguayTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Paraguay Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">IRP Threshold</strong> applies
            only after annual gross personal-service income exceeds PYG{" "}
            {PY_IRP_GROSS_INCOME_THRESHOLD.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">IPS</strong> is modeled as a{" "}
            {(PY_IPS_EMPLOYEE_RATE * 100).toFixed(0)}% employee contribution
            for ordinary private-sector employment when coverage is selected.
          </li>
          <li>
            <strong className="text-zinc-300">Aguinaldo</strong> can be
            included in annual gross, added on top, or excluded. The modeled
            statutory amount is{" "}
            {PY_AGUINALDO_MONTHS === 1
              ? "one extra month"
              : `${PY_AGUINALDO_MONTHS} extra months`}{" "}
            of ordinary salary and is excluded from IRP and IPS.
          </li>
          <li>
            <strong className="text-zinc-300">Deductible Expenses</strong>{" "}
            include modeled DNIT-supported personal and family expenses such as
            maintenance, education, health, housing, clothing, mobility, and
            recreation, capped here at salary after IPS.
          </li>
          <li>
            <strong className="text-zinc-300">Retirement Top-Ups</strong> are
            not shown for ordinary employees because the modeled pension item is
            the statutory IPS payroll contribution.
          </li>
        </ul>
      </div>
    </section>
  );
}
