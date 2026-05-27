"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
  DO_2026_MINIMUM_WAGE_FOR_SDSS_CAPS,
  DO_AFP_MONTHLY_SALARY_CAP,
  DO_AFP_EMPLOYEE_RATE,
  DO_CHRISTMAS_SALARY_MONTHS,
  DO_EDUCATION_EXPENSE_LIMIT,
  DO_EDUCATION_EXPENSE_RATE_LIMIT,
  DO_SFS_MONTHLY_SALARY_CAP,
  DO_SFS_EMPLOYEE_RATE,
} from "@/lib/countries/do/constants/tax-year-2026";
import type {
  DOCalculatorInputs,
  DOChristmasSalaryMode,
} from "@/lib/countries/do/types";
import { clampAmount } from "@/lib/utils";

function getOrdinaryMonthlySalary(inputs: DOCalculatorInputs) {
  if (inputs.christmasSalaryMode === "includedInGross") {
    return Math.max(0, inputs.grossSalary / (12 + DO_CHRISTMAS_SALARY_MONTHS));
  }

  return Math.max(0, inputs.grossSalary / 12);
}

const DO_CHRISTMAS_SALARY_OPTIONS = [
  {
    value: "includedInGross",
    label: "Included in gross",
  },
  {
    value: "additionalToGross",
    label: "Add statutory 13th salary",
  },
  {
    value: "none",
    label: "Not paid / exclude",
  },
] satisfies Array<{ value: DOChristmasSalaryMode; label: string }>;

export default function DOCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<DOCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const educationLimit = contributionLimits.educationExpenses?.limit ?? 0;
  const ordinaryMonthlySalary = getOrdinaryMonthlySalary(inputs);

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
            id="do-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="do-christmas-salary"
            label="Christmas Salary"
            value={inputs.christmasSalaryMode}
            onChange={(christmasSalaryMode) =>
              setInputs((current) => {
                const nextInputs = { ...current, christmasSalaryMode };
                const nextOrdinaryMonthlySalary =
                  getOrdinaryMonthlySalary(nextInputs);

                return {
                  ...nextInputs,
                  sdssSalaryMonthly: Math.min(
                    current.sdssSalaryMonthly,
                    nextOrdinaryMonthlySalary,
                  ),
                };
              })
            }
            options={DO_CHRISTMAS_SALARY_OPTIONS}
            description="Models the legal salario de Navidad as one-twelfth of ordinary annual salary, exempt from ISR and SDSS deductions."
          />
          <BooleanSelectField
            id="do-sdss-coverage"
            label="SDSS Payroll Coverage"
            value={inputs.sdssCovered}
            onChange={(sdssCovered) =>
              setInputs((current) => ({
                ...current,
                sdssCovered,
                sdssSalaryMonthly: sdssCovered
                  ? current.sdssSalaryMonthly || getOrdinaryMonthlySalary(current)
                  : 0,
              }))
            }
            trueLabel="AFP and SFS withheld"
            falseLabel="No employee SDSS withholding"
            trueFirst
            description="Formal local payroll normally withholds AFP and SFS; switch off only when you have confirmed no Dominican SDSS employee withholding applies."
          />
          {inputs.sdssCovered ? (
            <CurrencyAmountField
              id="do-sdss-salary-monthly"
              label="Monthly SDSS Salary"
              value={inputs.sdssSalaryMonthly || ordinaryMonthlySalary}
              onChange={(sdssSalaryMonthly) =>
                setInputs((current) => ({
                  ...current,
                  sdssSalaryMonthly: Math.min(
                    Math.max(0, sdssSalaryMonthly),
                    getOrdinaryMonthlySalary(current),
                  ),
                }))
              }
              currency={currency}
              min={0}
              max={ordinaryMonthlySalary}
              step={1000}
              description={`Leave at 0 to use ordinary monthly salary. AFP is capped at RD$${DO_AFP_MONTHLY_SALARY_CAP.toLocaleString()} monthly and SFS at RD$${DO_SFS_MONTHLY_SALARY_CAP.toLocaleString()} monthly.`}
            />
          ) : null}
          <BooleanSelectField
            id="do-fringe-benefits-taxed"
            label="Employee-Taxable Fringe Benefits"
            value={inputs.fringeBenefitsTaxedToEmployee}
            onChange={(fringeBenefitsTaxedToEmployee) =>
              setInputs((current) => ({
                ...current,
                fringeBenefitsTaxedToEmployee,
                taxableNonCashBenefits: fringeBenefitsTaxedToEmployee
                  ? current.taxableNonCashBenefits
                  : 0,
              }))
            }
            trueLabel="Tax to employee"
            falseLabel="Employer substitute tax"
            description="DGII fringe benefits are employer-reported by default; select employee-taxable only for the official tax-exempt-employer case."
          />
          {inputs.fringeBenefitsTaxedToEmployee ? (
            <CurrencyAmountField
              id="do-taxable-fringe-benefits"
              label="Annual Employee-Taxable Fringe Benefits"
              value={inputs.taxableNonCashBenefits ?? 0}
              onChange={(taxableNonCashBenefits) =>
                setInputs((current) => ({
                  ...current,
                  taxableNonCashBenefits: Math.max(0, taxableNonCashBenefits),
                }))
              }
              currency={currency}
              min={0}
              step={5000}
              description="Non-cash benefits included in employee ISR withholding when the employer is exempt or not an ISR taxpayer."
            />
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        educationLimit > 0 ? (
          <ContributionSlider
            label={contributionLimits.educationExpenses.name}
            value={Math.min(
              inputs.contributions.educationExpenses ?? 0,
              educationLimit,
            )}
            onChange={(amount) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  educationExpenses: clampAmount(amount, educationLimit),
                },
              }))
            }
            max={educationLimit}
            step={500}
            currency={currency}
            description={contributionLimits.educationExpenses.description}
          />
        ) : undefined
      }
      contributionsTitle="DGII Education Deduction"
      contributionsDescription="Law 179-09 education expenses for salaried taxpayers"
      seoInfo={<DominicanRepublicTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Dominican Republic salaried ISR using the DGII 2026
            scale, employee AFP and SFS deductions with TSS caps, and the Law
            179-09 education-expense deduction. You can set the actual monthly
            SDSS salary and the official case where non-cash fringe benefits
            are employee-taxable. The legal Christmas salary is modeled
            separately as{" "}
            {DO_CHRISTMAS_SALARY_MONTHS === 1
              ? "one additional month"
              : `${DO_CHRISTMAS_SALARY_MONTHS} additional months`}{" "}
            of ordinary salary.
          </p>
        </InfoPanel>
      }
    />
  );
}

function DominicanRepublicTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Dominican Republic Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">ISR</strong> uses the DGII 2026
            annual salary scale with fixed tax amounts in the upper bands.
          </li>
          <li>
            <strong className="text-zinc-300">SDSS Payroll Deductions</strong>{" "}
            model AFP at {(DO_AFP_EMPLOYEE_RATE * 100).toFixed(2)}% and SFS at{" "}
            {(DO_SFS_EMPLOYEE_RATE * 100).toFixed(2)}%, using the RD$
            {DO_2026_MINIMUM_WAGE_FOR_SDSS_CAPS.toLocaleString()} reference
            minimum wage for contribution caps and the selected monthly SDSS
            salary.
          </li>
          <li>
            <strong className="text-zinc-300">Christmas Salary</strong> can be
            included in annual gross, added on top, or excluded. The modeled
            statutory amount is exempt from ISR and outside the SDSS salary base.
          </li>
          <li>
            <strong className="text-zinc-300">Fringe Benefits</strong> are
            excluded from employee tax by default when the employer pays the
            complementary-compensation tax; the employee-taxable option adds
            them to ISR salary only for the DGII tax-exempt-employer case.
          </li>
          <li>
            <strong className="text-zinc-300">Education Expenses</strong> are
            modeled under Law 179-09 up to{" "}
            {(DO_EDUCATION_EXPENSE_RATE_LIMIT * 100).toFixed(0)}% of modeled
            taxable income and no more than RD$
            {DO_EDUCATION_EXPENSE_LIMIT.toLocaleString()} for 2026.
          </li>
        </ul>
      </div>
    </section>
  );
}
