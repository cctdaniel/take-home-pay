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
import {
  SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_CAP,
  SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_MIN,
} from "@/lib/countries/sa/constants/tax-year-2026";
import type {
  SACalculatorInputs,
  SAHousingAllowanceType,
  SAWorkerType,
} from "@/lib/countries/sa/types";

const WORKER_TYPE_OPTIONS: SelectOption<SAWorkerType>[] = [
  { value: "expatriate", label: "Expatriate employee" },
  { value: "saudi_standard", label: "Saudi existing-system GOSI" },
  {
    value: "saudi_new_system_2026",
    label: "Saudi new-system GOSI (2026 phase-in)",
  },
];
const HOUSING_ALLOWANCE_OPTIONS: SelectOption<SAHousingAllowanceType>[] = [
  { value: "none", label: "No housing allowance" },
  { value: "cash", label: "Cash housing allowance" },
  { value: "inKind", label: "In-kind employer housing" },
];

export default function SaudiArabiaCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<SACalculatorInputs>(country);
  const isSaudiEmployee = inputs.workerType !== "expatriate";

  const setWorkerType = (workerType: SAWorkerType) => {
    setInputs((current) => ({
      ...current,
      workerType,
      gosiBasicWageMonthly:
        workerType !== "expatriate"
          ? current.gosiBasicWageMonthly ||
            Math.max(0, current.grossSalary / 12)
          : 0,
      gosiContributoryWageMonthly:
        workerType !== "expatriate"
          ? current.gosiContributoryWageMonthly ||
            Math.min(
              Math.max(
                current.grossSalary / 12,
                SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_MIN,
              ),
              SA_GOSI_MONTHLY_CONTRIBUTORY_WAGE_CAP,
            )
          : 0,
      housingAllowanceType:
        workerType !== "expatriate" ? current.housingAllowanceType : "none",
      cashHousingAllowanceMonthly:
        workerType !== "expatriate" ? current.cashHousingAllowanceMonthly : 0,
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
        <div className="space-y-4">
          <CalculatorFieldGrid columns={2}>
            <PayFrequencyField
              id="sa-pay-frequency"
              value={inputs.payFrequency}
              onChange={setPayFrequency}
            />
            <SelectField
              id="sa-worker-type"
              label="Worker Type"
              value={inputs.workerType}
              onChange={setWorkerType}
              options={WORKER_TYPE_OPTIONS}
              description="Expatriates have no employee GOSI deduction. Saudi employees can use the existing-system rates or the 2026 new Social Insurance Law phase-in for new contributors."
            />
            {isSaudiEmployee ? (
              <>
                <CurrencyAmountField
                  id="sa-gosi-basic-wage"
                  label="Basic wage for GOSI (monthly)"
                  value={inputs.gosiBasicWageMonthly}
                  onChange={(gosiBasicWageMonthly) =>
                    setInputs((current) => ({
                      ...current,
                      gosiBasicWageMonthly: Math.max(
                        0,
                        gosiBasicWageMonthly,
                      ),
                    }))
                  }
                  currency={currency}
                  min={0}
                  step={500}
                  description="Basic wage used to build the GOSI contributory wage."
                />
                <SelectField
                  id="sa-housing-allowance-type"
                  label="Housing allowance for GOSI"
                  value={inputs.housingAllowanceType}
                  onChange={(housingAllowanceType) =>
                    setInputs((current) => ({
                      ...current,
                      housingAllowanceType,
                      cashHousingAllowanceMonthly:
                        housingAllowanceType === "cash"
                          ? current.cashHousingAllowanceMonthly
                          : 0,
                    }))
                  }
                  options={HOUSING_ALLOWANCE_OPTIONS}
                  description="GOSI includes cash housing allowance, or values in-kind housing at two months of basic wage per year."
                />
                {inputs.housingAllowanceType === "cash" ? (
                  <CurrencyAmountField
                    id="sa-cash-housing-allowance"
                    label="Cash housing allowance (monthly)"
                    value={inputs.cashHousingAllowanceMonthly}
                    onChange={(cashHousingAllowanceMonthly) =>
                      setInputs((current) => ({
                        ...current,
                        cashHousingAllowanceMonthly: Math.max(
                          0,
                          cashHousingAllowanceMonthly,
                        ),
                      }))
                    }
                    currency={currency}
                    min={0}
                    step={500}
                    description="Monthly cash housing allowance included in the GOSI contributory wage."
                  />
                ) : null}
              </>
            ) : null}
          </CalculatorFieldGrid>
        </div>
      }
      contributionsTitle="Saudi Payroll Coverage Notes"
      contributionsDescription="Personal income tax is 0%; Saudi/GCC employee GOSI treatment and wage base are selected above"
      contributionsEmptyState="The expatriate/Saudi employee GOSI treatment is selected above. Individual employment earnings are modeled with no Saudi personal income tax. Employer-only occupational hazard, dependent fees, benefits, business income, and zakat need employer, residency, or business facts rather than annual employee deduction sliders."
      infoCard={
        <InfoPanel title="Saudi Arabia Payroll Scope">
          <p>
            Saudi Arabia does not levy individual income tax on earnings derived
            only from employment in Saudi Arabia. Expatriates are modeled with
            no employee-side GOSI deduction; Saudi employees can be modeled
            under the existing system or the 2026 new-system phase-in. The
            GOSI wage base uses the entered basic wage plus cash housing
            allowance, or in-kind housing valued at two months of basic wage
            per year. The existing system uses 9% annuities plus 0.75% SANED.
            The new-system 2026 annual model uses a blended 9.75% annuities
            rate plus 0.75% SANED, reflecting the July step-up during the year.
          </p>
        </InfoPanel>
      }
      seoInfo={<SaudiArabiaTaxInfo />}
    />
  );
}

function SaudiArabiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Saudi Arabia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - employment
            earnings are not subject to Saudi individual income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Expatriate Employees</strong> -
            no employee-side GOSI deduction is modeled; occupational hazard
            coverage is employer-paid.
          </li>
          <li>
            <strong className="text-zinc-300">Saudi Employees</strong> - the
            existing-system employee deduction is modeled as 9% GOSI annuities
            plus 0.75% SANED. The 2026 new-system option uses a blended 9.75%
            annuities rate plus 0.75% SANED for new contributors under the 2024
            Social Insurance Law phase-in.
          </li>
          <li>
            <strong className="text-zinc-300">GOSI Wage Base</strong> - GOSI
            defines the wage base as basic wage plus cash housing allowance, or
            in-kind housing valued at two months of basic salary.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus any selected employee GOSI contributions.
          </li>
        </ul>
      </div>
    </section>
  );
}
