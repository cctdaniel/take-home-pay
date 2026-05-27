"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
  NumberStepperField,
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
import {
  SI_AGE_70_ALLOWANCE,
  SI_DEPENDENT_CHILD_BASE_ALLOWANCE,
  SI_FULL_DISABILITY_ALLOWANCE,
  SI_MAY_2026_NMB95_PRICE,
  SI_MEAL_REIMBURSEMENT_DAILY_JAN_JUN_2026,
  SI_OTHER_DEPENDENT_ALLOWANCE,
  SI_PUBLIC_SECTOR_HOLIDAY_ALLOWANCE_2026,
  SI_SPECIAL_CARE_CHILD_BASE_ALLOWANCE,
  SI_TRANSPORT_KILOMETRE_RATE_PETROL_SHARE,
  SI_YOUNG_WORKER_ALLOWANCE,
} from "@/lib/countries/si/constants/tax-year-2026";
import type {
  SICalculatorInputs,
  SIContributionInputs,
} from "@/lib/countries/si/types";

const MAX_DEPENDENTS = 10;

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function clampAge(value: number) {
  return Math.min(Math.max(18, Math.floor(value)), 100);
}

function clampCount(value: number) {
  return Math.min(Math.max(0, Math.floor(value)), MAX_DEPENDENTS);
}

export default function SICountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<SICalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const pensionLimit = contributionLimits.retirementContribution?.limit ?? 0;

  const setContribution = (
    key: keyof SIContributionInputs,
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
            id="si-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberField
            id="si-age"
            label="Age"
            value={inputs.age}
            min={18}
            max={100}
            onChange={(age) =>
              setInputs((current) => {
                const nextAge = clampAge(age);

                return {
                  ...current,
                  age: nextAge,
                  isResidentYoungWorker:
                    nextAge < 29 ? current.isResidentYoungWorker : false,
                };
              })
            }
            description={`Age 70+ adds a EUR ${SI_AGE_70_ALLOWANCE.toLocaleString()} allowance.`}
          />
          <BooleanSelectField
            id="si-young-worker"
            label="Resident Young-Worker Relief"
            value={inputs.isResidentYoungWorker && inputs.age < 29}
            onChange={(isResidentYoungWorker) =>
              setInputs((current) => ({
                ...current,
                isResidentYoungWorker:
                  current.age < 29 ? isResidentYoungWorker : false,
              }))
            }
            trueLabel="Apply"
            falseLabel={inputs.age < 29 ? "Do not apply" : "Not eligible"}
            trueFirst
            description={`For resident employment income before age 29: EUR ${SI_YOUNG_WORKER_ALLOWANCE.toLocaleString()} annual allowance.`}
          />
          <BooleanSelectField
            id="si-full-disability"
            label="100% Disability Allowance"
            value={inputs.isFullyDisabled}
            onChange={(isFullyDisabled) =>
              setInputs((current) => ({ ...current, isFullyDisabled }))
            }
            trueLabel="Apply"
            falseLabel="Do not apply"
            description={`Personal allowance of EUR ${SI_FULL_DISABILITY_ALLOWANCE.toLocaleString()} for 100% physical disability.`}
          />
          <NumberStepperField
            id="si-dependent-children"
            label="Dependent Children"
            value={inputs.numberOfDependentChildren}
            onChange={(numberOfDependentChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfDependentChildren: clampCount(
                  numberOfDependentChildren,
                ),
              }))
            }
            max={MAX_DEPENDENTS}
            description={`Ordinary dependent children; first-child base allowance EUR ${SI_DEPENDENT_CHILD_BASE_ALLOWANCE.toLocaleString()}.`}
          />
          <NumberStepperField
            id="si-special-care-children"
            label="Special-Care Children"
            value={inputs.numberOfSpecialCareChildren}
            onChange={(numberOfSpecialCareChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfSpecialCareChildren: clampCount(
                  numberOfSpecialCareChildren,
                ),
              }))
            }
            max={MAX_DEPENDENTS}
            description={`Children needing special care; base allowance EUR ${SI_SPECIAL_CARE_CHILD_BASE_ALLOWANCE.toLocaleString()} each before ordinal increases.`}
          />
          <NumberStepperField
            id="si-other-dependents"
            label="Other Dependents"
            value={inputs.numberOfOtherDependents}
            onChange={(numberOfOtherDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfOtherDependents: clampCount(numberOfOtherDependents),
              }))
            }
            max={MAX_DEPENDENTS}
            description={`Spouse, parent, or other eligible family member allowance: EUR ${SI_OTHER_DEPENDENT_ALLOWANCE.toLocaleString()} each.`}
          />
          <NumberField
            id="si-meal-workdays"
            label="Meal Reimbursement Workdays"
            value={inputs.mealReimbursementWorkdays}
            min={0}
            max={366}
            onChange={(mealReimbursementWorkdays) =>
              setInputs((current) => ({
                ...current,
                mealReimbursementWorkdays: Math.min(
                  Math.max(0, Math.floor(mealReimbursementWorkdays)),
                  366,
                ),
              }))
            }
            description={`Adds tax-exempt meal reimbursement using the 2026 public-sector benchmark of EUR ${SI_MEAL_REIMBURSEMENT_DAILY_JAN_JUN_2026.toLocaleString()} per workday.`}
          />
          <CurrencyAmountField
            id="si-transport-reimbursement"
            label="Annual Transport Reimbursement"
            value={inputs.transportReimbursementAnnual}
            onChange={(transportReimbursementAnnual) =>
              setInputs((current) => ({
                ...current,
                transportReimbursementAnnual: Math.max(
                  0,
                  transportReimbursementAnnual,
                ),
              }))
            }
            currency={currency}
            step={10}
            description={`Enter the annual tax-exempt commute reimbursement. The May 2026 public-sector kilometre proxy is ${(SI_TRANSPORT_KILOMETRE_RATE_PETROL_SHARE * 100).toFixed(0)}% of EUR ${SI_MAY_2026_NMB95_PRICE.toLocaleString()} per km.`}
          />
          <CurrencyAmountField
            id="si-holiday-allowance"
            label="Holiday Allowance"
            value={inputs.holidayAllowance}
            onChange={(holidayAllowance) =>
              setInputs((current) => ({
                ...current,
                holidayAllowance: Math.max(0, holidayAllowance),
              }))
            }
            currency={currency}
            step={50}
            description={`Optional tax-exempt annual leave allowance; 2026 public-sector full amount is EUR ${SI_PUBLIC_SECTOR_HOLIDAY_ALLOWANCE_2026.toLocaleString()}.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        pensionLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.retirementContribution?.name ??
              "Supplementary pension contribution"
            }
            value={Math.min(
              inputs.contributions.retirementContribution ?? 0,
              pensionLimit,
            )}
            onChange={(amount) =>
              setContribution("retirementContribution", amount)
            }
            max={pensionLimit}
            step={Math.max(1, Math.round(pensionLimit / 100))}
            currency={currency}
            description={
              contributionLimits.retirementContribution?.description ??
              "Deductible Slovenian supplementary pension contribution."
            }
          />
        ) : undefined
      }
      contributionsTitle="Slovenia Supplementary Pension Deduction"
      contributionsDescription="Modeled PDPZ supplementary pension contributions with the 5.844% salary limit and 2026 cap"
      seoInfo={<SloveniaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Slovenia resident employment income with the 2026
            five-band PIT schedule, general and low-income allowances, employee
            social security, long-term care, and compulsory health
            contributions.
          </p>
          <p className="mt-2">
            The household fields model dependent child, special-care child, and
            other dependent family-member allowances that can be claimed during
            payroll prepayment or in the annual assessment.
          </p>
          <p className="mt-2">
            Meal reimbursement, commute reimbursement, and holiday allowance
            are modeled above as tax-exempt cash paid on top of taxable salary.
            Employer-only contributions, business-performance pay exemptions,
            student relief, new-resident mechanics, and exact monthly
            withholding timing remain outside this annual model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SloveniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Slovenia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Taxable Income</strong> applies
            the 2026 general allowance, low-income general allowance formula,
            and selected personal or family allowances.
          </li>
          <li>
            <strong className="text-zinc-300">Dependents</strong> use the
            published 2026 child ordinal increases, special-care child base
            amount, and other dependent family-member allowance.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            include employee social-security and long-term-care contributions at
            23.1%, plus the fixed compulsory health contribution.
          </li>
          <li>
            <strong className="text-zinc-300">PDPZ Pension</strong> is
            deductible up to the lower of 5.844% of salary and EUR 3,224.18.
          </li>
          <li>
            <strong className="text-zinc-300">
              Tax-Exempt Reimbursements
            </strong>{" "}
            add meal reimbursement, commute reimbursement, and holiday allowance
            to cash take-home without increasing PIT or social contributions.
          </li>
        </ul>
      </div>
    </section>
  );
}
