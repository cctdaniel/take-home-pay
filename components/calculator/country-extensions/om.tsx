"use client";

import {
  BooleanSelectField,
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
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  OM_EXPAT_PROVIDENT_EMPLOYER_RATE,
  OM_OPTIONAL_SAVINGS_DEPOSIT_MIN,
  OM_SPF_INSURED_WAGE_MONTHLY_CAP,
} from "@/lib/countries/om/constants/tax-year-2026";
import type {
  OMCalculatorInputs,
  OMContributionInputs,
  OMWorkerType,
} from "@/lib/countries/om/types";

const WORKER_TYPE_OPTIONS: SelectOption<OMWorkerType>[] = [
  { value: "expatriate", label: "Expatriate employee" },
  { value: "omani", label: "Omani employee" },
];

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function OmanCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<OMCalculatorInputs>(country);
  const isOmaniEmployee = inputs.workerType === "omani";
  const monthlyGrossSalary = Math.max(0, inputs.grossSalary / 12);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const optionalSavingsLimit =
    contributionLimits.retirementContribution?.limit ?? 0;

  const setContribution = (
    key: keyof OMContributionInputs,
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

  const setWorkerType = (workerType: OMWorkerType) => {
    setInputs((current) => ({
      ...current,
      workerType,
      spfInsuredWageMonthly:
        workerType === "omani"
          ? current.spfInsuredWageMonthly ||
            Math.min(
              Math.max(0, current.grossSalary / 12),
              OM_SPF_INSURED_WAGE_MONTHLY_CAP,
            )
          : 0,
      expatProvidentSchemeApplied:
        workerType === "expatriate"
          ? current.expatProvidentSchemeApplied
          : false,
      expatProvidentBasicWageMonthly:
        workerType === "expatriate"
          ? current.expatProvidentBasicWageMonthly
          : 0,
      contributions:
        workerType === "expatriate" && !current.expatProvidentSchemeApplied
          ? {
              ...current.contributions,
              retirementContribution: 0,
            }
          : current.contributions,
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
            id="om-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="om-worker-type"
            label="Worker Type"
            value={inputs.workerType}
            onChange={setWorkerType}
            options={WORKER_TYPE_OPTIONS}
            description="Expatriates have no employee-side Oman social protection deduction; Omani employees deduct capped SPF old-age and employment-security employee shares."
          />
          {isOmaniEmployee ? (
            <CurrencyAmountField
              id="om-spf-insured-wage"
              label="Monthly SPF Insured Wage"
              value={inputs.spfInsuredWageMonthly}
              onChange={(spfInsuredWageMonthly) =>
                setInputs((current) => ({
                  ...current,
                  spfInsuredWageMonthly: Math.min(
                    Math.max(0, spfInsuredWageMonthly),
                    OM_SPF_INSURED_WAGE_MONTHLY_CAP,
                  ),
                }))
              }
              currency={currency}
              min={0}
              max={OM_SPF_INSURED_WAGE_MONTHLY_CAP}
              step={50}
              description={`Leave at 0 to use monthly gross salary as a proxy. The Social Protection Fund cap modeled here is OMR ${OM_SPF_INSURED_WAGE_MONTHLY_CAP.toLocaleString()} per month.`}
            />
          ) : null}
          {!isOmaniEmployee ? (
            <BooleanSelectField
              id="om-expat-provident-scheme"
              label="Employer Provident Scheme"
              value={inputs.expatProvidentSchemeApplied}
              onChange={(expatProvidentSchemeApplied) =>
                setInputs((current) => ({
                  ...current,
                  expatProvidentSchemeApplied,
                  expatProvidentBasicWageMonthly: expatProvidentSchemeApplied
                    ? current.expatProvidentBasicWageMonthly ||
                      Math.max(0, current.grossSalary / 12)
                    : 0,
                  contributions: expatProvidentSchemeApplied
                    ? current.contributions
                    : {
                        ...current.contributions,
                        retirementContribution: 0,
                      },
                }))
              }
              trueLabel="Employer enrolled"
              falseLabel="Not applied"
              description={`Shows the non-Omani provident-scheme employer deposit at ${(OM_EXPAT_PROVIDENT_EMPLOYER_RATE * 100).toFixed(0)}% of monthly basic wage as context only.`}
            />
          ) : null}
          {!isOmaniEmployee && inputs.expatProvidentSchemeApplied ? (
            <CurrencyAmountField
              id="om-expat-provident-basic-wage"
              label="Monthly Basic Wage for Provident"
              value={inputs.expatProvidentBasicWageMonthly}
              onChange={(expatProvidentBasicWageMonthly) =>
                setInputs((current) => ({
                  ...current,
                  expatProvidentBasicWageMonthly: Math.min(
                    Math.max(0, expatProvidentBasicWageMonthly),
                    Math.max(0, current.grossSalary / 12),
                  ),
                }))
              }
              currency={currency}
              min={0}
              max={monthlyGrossSalary}
              step={50}
              description="Leave at 0 to use monthly gross salary as a proxy; otherwise enter the basic-wage portion used by the employer's provident-scheme registration."
            />
          ) : null}
        </CalculatorFieldGrid>
      }
      contributionsTitle="Oman SPF Savings Inputs"
      contributionsDescription="Optional savings deposits reduce cash take-home but do not create 2026 personal income tax relief"
      contributions={
        optionalSavingsLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.retirementContribution?.name ??
              "Optional SPF savings deposit"
            }
            value={Math.min(
              inputs.contributions.retirementContribution ?? 0,
              optionalSavingsLimit,
            )}
            onChange={(amount) =>
              setContribution("retirementContribution", amount)
            }
            max={optionalSavingsLimit}
            step={100}
            currency={currency}
            description={
              contributionLimits.retirementContribution?.description ??
              `Each optional deposit is expected to be at least OMR ${OM_OPTIONAL_SAVINGS_DEPOSIT_MIN.toLocaleString()} when made through SPF.`
            }
          />
        ) : undefined
      }
      contributionsEmptyState="Enable Omani employee coverage or employer provident-scheme enrollment to model optional SPF savings deposits. Oman has no 2026 personal income tax relief here, and employer-only work-injury, sick-leave, maternity-leave, and social-protection shares need employer facts rather than employee take-home deductions."
      infoCard={
        <InfoPanel title="Oman Payroll Scope">
          <p>
            Oman has enacted a personal income tax regime, but it is expected to
            apply from 1 January 2028, so this 2026 salary model has no PIT. The
            default expatriate employee scenario has no employee-side Oman social
            protection deduction. If your employer has enrolled you in the
            non-Omani provident scheme, turn it on above to show the employer
            deposit separately. Omani employees can be modeled with the SPF
            employee shares and optional savings deposits.
          </p>
        </InfoPanel>
      }
      seoInfo={<OmanTaxInfo />}
    />
  );
}

function OmanTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Oman Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - Oman has no
            personal income tax on 2026 employment salary; the enacted PIT
            regime is expected from 1 January 2028.
          </li>
          <li>
            <strong className="text-zinc-300">Expatriate Employees</strong> -
            no employee-side Oman social protection deduction is modeled; the
            employer provident scheme can be shown separately at{" "}
            {(OM_EXPAT_PROVIDENT_EMPLOYER_RATE * 100).toFixed(0)}% of basic
            wage when it applies.
          </li>
          <li>
            <strong className="text-zinc-300">Omani Employees</strong> - the
            employee deduction is modeled as 7.5% old-age, disability, and
            death insurance plus 0.5% employment security on the selected SPF
            insured wage, capped at OMR 3,000 per month.
          </li>
          <li>
            <strong className="text-zinc-300">Optional Savings</strong> -
            selected SPF savings deposits reduce cash take-home, with no 2026
            personal income tax relief.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus employee social protection contributions
            and any selected optional cash savings deposit.
          </li>
        </ul>
      </div>
    </section>
  );
}
