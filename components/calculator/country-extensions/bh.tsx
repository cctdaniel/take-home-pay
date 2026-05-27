"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
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
import { BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP } from "@/lib/countries/bh/constants/tax-year-2026";
import type {
  BHCalculatorInputs,
  BHWorkerType,
} from "@/lib/countries/bh/types";

const WORKER_TYPE_OPTIONS: SelectOption<BHWorkerType>[] = [
  { value: "expatriate", label: "Expatriate employee" },
  { value: "bahraini", label: "Bahraini employee" },
];

function clampMonthlyAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function BahrainCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BHCalculatorInputs>(country);
  const monthlyCashGross = Math.max(0, inputs.grossSalary) / 12;
  const monthlySioBaseLimit = Math.min(
    monthlyCashGross,
    BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP,
  );
  const sioBasicWageMonthly = clampMonthlyAmount(
    inputs.sioBasicWageMonthly ||
      inputs.sioContributoryWageMonthly ||
      monthlySioBaseLimit,
    monthlySioBaseLimit,
  );
  const sioRecurringAllowancesMonthly = clampMonthlyAmount(
    inputs.sioRecurringAllowancesMonthly ?? 0,
    Math.max(0, monthlySioBaseLimit - sioBasicWageMonthly),
  );

  const setWorkerType = (workerType: BHWorkerType) => {
    setInputs((current) => ({
      ...current,
      workerType,
      sioBasicWageMonthly:
        current.sioBasicWageMonthly ||
        Math.min(
          Math.max(0, current.grossSalary) / 12,
          BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP,
        ),
      sioRecurringAllowancesMonthly:
        current.sioRecurringAllowancesMonthly ?? 0,
      sioContributoryWageMonthly: 0,
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
            id="bh-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="bh-worker-type"
            label="Worker Type"
            value={inputs.workerType}
            onChange={setWorkerType}
            options={WORKER_TYPE_OPTIONS}
            description="Expatriates deduct 1% employee unemployment insurance; Bahraini employees deduct the 8% employee SIO share."
          />
          <CurrencyAmountField
            id="bh-sio-basic-wage"
            label="Basic Wage for SIO (Monthly)"
            value={sioBasicWageMonthly}
            onChange={(sioBasicWageMonthly) =>
              setInputs((current) => ({
                ...current,
                sioBasicWageMonthly: clampMonthlyAmount(
                  sioBasicWageMonthly,
                  monthlySioBaseLimit,
                ),
                sioRecurringAllowancesMonthly: clampMonthlyAmount(
                  current.sioRecurringAllowancesMonthly ?? 0,
                  Math.max(
                    0,
                    monthlySioBaseLimit -
                      clampMonthlyAmount(
                        sioBasicWageMonthly,
                        monthlySioBaseLimit,
                      ),
                  ),
                ),
                sioContributoryWageMonthly: 0,
              }))
            }
            currency={currency}
            min={0}
            max={monthlySioBaseLimit}
            step={25}
            description="Monthly basic wage included in the SIO salary base. The total modeled SIO base is capped at BHD 4,000 per month."
          />
          <CurrencyAmountField
            id="bh-sio-recurring-allowances"
            label="Recurring Allowances for SIO (Monthly)"
            value={sioRecurringAllowancesMonthly}
            onChange={(sioRecurringAllowancesMonthly) =>
              setInputs((current) => ({
                ...current,
                sioBasicWageMonthly,
                sioRecurringAllowancesMonthly: clampMonthlyAmount(
                  sioRecurringAllowancesMonthly,
                  Math.max(0, monthlySioBaseLimit - sioBasicWageMonthly),
                ),
                sioContributoryWageMonthly: 0,
              }))
            }
            currency={currency}
            min={0}
            max={Math.max(0, monthlySioBaseLimit - sioBasicWageMonthly)}
            step={25}
            description="Regular cash allowances that are part of the SIO wage base. Employer-only benefits and end-of-service funding are shown as scope notes, not employee deductions."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Bahrain Payroll Coverage Notes"
      contributionsDescription="Personal income tax is 0%; employee SIO treatment is selected above by worker type"
      contributionsEmptyState="Bahrain ordinary employment salary has no personal income tax in this model. Employee SIO is modeled through worker type plus monthly basic wage and recurring allowance components. Employer SIO, end-of-service funding, LMRA fees, and non-cash benefit valuation affect employer cost or contract reporting rather than employee take-home deductions."
      infoCard={
        <InfoPanel title="Bahrain Payroll Scope">
          <p>
            Bahrain does not levy personal income tax on ordinary employment
            salary. This model deducts only employee-side SIO contributions:
            1% unemployment insurance for expatriates, or 7% pension insurance
            plus 1% unemployment insurance for Bahraini employees, applied to a
            monthly SIO wage base built from basic wage plus recurring cash
            allowances and capped at BHD 4,000.
          </p>
        </InfoPanel>
      }
      seoInfo={<BahrainTaxInfo />}
    />
  );
}

function BahrainTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Bahrain Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - Bahrain has
            no personal income tax on ordinary employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">Expatriate Employees</strong> -
            the employee deduction modeled here is 1% unemployment insurance on
            the modeled SIO wage base.
          </li>
          <li>
            <strong className="text-zinc-300">Bahraini Employees</strong> - the
            employee SIO deduction is modeled as 7% pension insurance plus 1%
            unemployment insurance on the modeled SIO wage base.
          </li>
          <li>
            <strong className="text-zinc-300">SIO Wage Base</strong> - enter the
            monthly basic wage and recurring cash allowances used for SIO. The
            calculator caps the contribution base at BHD 4,000 per month and at
            monthly cash gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus employee-side social insurance
            contributions.
          </li>
        </ul>
      </div>
    </section>
  );
}
