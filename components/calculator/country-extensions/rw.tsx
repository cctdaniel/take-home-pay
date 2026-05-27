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
import {
  RW_HOUSING_BENEFIT_RATE,
  RW_MOTOR_VEHICLE_BENEFIT_RATE,
} from "@/lib/countries/rw/constants/tax-year-2026";
import type {
  RWCalculatorInputs,
  RWPensionCoverage,
} from "@/lib/countries/rw/types";

export default function RWCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<RWCalculatorInputs>(country);
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
            id="rw-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="rw-pension-coverage"
            label="RSSB Pension Coverage"
            value={inputs.pensionCoverage}
            onChange={(pensionCoverage) =>
              setInputs((current) => ({
                ...current,
                pensionCoverage: pensionCoverage as RWPensionCoverage,
              }))
            }
            options={[
              {
                value: "employee",
                label: "Employee 6%",
              },
              {
                value: "voluntaryMember",
                label: "Voluntary member 12%",
              },
            ]}
            description="Ordinary employees pay 6%; approved voluntary members pay 12% of the selected RSSB contribution salary."
          />
          <CurrencyAmountField
            id="rw-rssb-contribution-salary"
            label="Monthly RSSB Contribution Salary"
            value={Math.min(
              inputs.rssbContributionSalaryMonthly || monthlyCashSalary,
              monthlyCashSalary,
            )}
            onChange={(rssbContributionSalaryMonthly) =>
              setInputs((current) => ({
                ...current,
                rssbContributionSalaryMonthly: Math.min(
                  Math.max(0, rssbContributionSalaryMonthly),
                  monthlyCashSalary,
                ),
              }))
            }
            currency={currency}
            step={50000}
            min={0}
            max={monthlyCashSalary}
            description="Leave at 0 to use monthly cash salary. This base is used for pension and maternity leave contributions."
          />
          <BooleanSelectField
            id="rw-rssb-medical-scheme"
            label="RSSB Medical Scheme"
            value={inputs.rssbMedicalSchemeCovered}
            onChange={(rssbMedicalSchemeCovered) =>
              setInputs((current) => ({
                ...current,
                rssbMedicalSchemeCovered,
              }))
            }
            trueLabel="Covered"
            falseLabel="Not covered"
            description="Adds the 7.5% employee share when the employee is covered by the RSSB medical scheme."
          />
          {inputs.rssbMedicalSchemeCovered ? (
            <CurrencyAmountField
              id="rw-rssb-medical-basic-salary"
              label="Monthly Medical Basic Salary"
              value={Math.min(
                inputs.rssbMedicalBasicSalaryMonthly || monthlyCashSalary,
                monthlyCashSalary,
              )}
              onChange={(rssbMedicalBasicSalaryMonthly) =>
                setInputs((current) => ({
                  ...current,
                  rssbMedicalBasicSalaryMonthly: Math.min(
                    Math.max(0, rssbMedicalBasicSalaryMonthly),
                    monthlyCashSalary,
                  ),
                }))
              }
              currency={currency}
              step={50000}
              min={0}
              max={monthlyCashSalary}
              description="RSSB medical scheme contributions are 7.5% of the employee's basic salary."
            />
          ) : null}
          <BooleanSelectField
            id="rw-housing-benefit"
            label="Employer Housing Benefit"
            value={inputs.hasHousingBenefit}
            onChange={(hasHousingBenefit) =>
              setInputs((current) => ({
                ...current,
                hasHousingBenefit,
              }))
            }
            trueLabel="Provided"
            falseLabel="None"
            description={`Adds taxable benefits in kind at ${(RW_HOUSING_BENEFIT_RATE * 100).toFixed(0)}% of cash employment income.`}
          />
          <BooleanSelectField
            id="rw-motor-vehicle-benefit"
            label="Employer Vehicle Benefit"
            value={inputs.hasMotorVehicleBenefit}
            onChange={(hasMotorVehicleBenefit) =>
              setInputs((current) => ({
                ...current,
                hasMotorVehicleBenefit,
              }))
            }
            trueLabel="Provided"
            falseLabel="None"
            description={`Adds taxable benefits in kind at ${(RW_MOTOR_VEHICLE_BENEFIT_RATE * 100).toFixed(0)}% of cash employment income.`}
          />
          <CurrencyAmountField
            id="rw-other-taxable-benefits-kind"
            label="Other Taxable Benefits in Kind"
            value={inputs.otherTaxableBenefitsInKind}
            onChange={(otherTaxableBenefitsInKind) =>
              setInputs((current) => ({
                ...current,
                otherTaxableBenefitsInKind: Math.max(
                  0,
                  otherTaxableBenefitsInKind,
                ),
              }))
            }
            currency={currency}
            step={100000}
            description="Enter other taxable benefit values, such as the taxable part of employer-paid rent or a low-interest loan benefit."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Rwanda RSSB Coverage Notes"
      contributionsDescription="PAYE, RSSB pension, voluntary-member, medical-scheme, and CBHI settings are selected above"
      contributionsEmptyState="The page exposes the RSSB employee, voluntary-member, and medical-scheme coverage choices above. EjoHeza and similar savings are not shown as annual sliders because the reviewed PAYE/RSSB salary sources do not make them a general employee payroll deduction."
      seoInfo={<RwandaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Rwanda PAYE using annualized monthly brackets, employee
            RSSB pension coverage, maternity deductions, optional RSSB medical
            scheme coverage, and the CBHI contribution calculated after PAYE and
            prior RSSB deductions.
          </p>
          <p className="mt-2">
            EjoHeza and similar savings are not exposed as annual deduction
            sliders because the reviewed Rwanda PAYE and RSSB salary sources do
            not make them a general PAYE deduction for ordinary employees.
          </p>
          <p className="mt-2">
            Employer-only contributions, occupational hazards, employer
            remittance details, EjoHeza account mechanics, and detailed
            low-interest loan valuation require employer, account, benefit
            valuation, or loan facts. RSSB salary bases and benefits in kind
            are modeled above because they affect employee take-home or PAYE.
          </p>
        </InfoPanel>
      }
    />
  );
}

function RwandaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Rwanda Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">PAYE</strong> uses annualized
            monthly tax brackets for a full-year employee.
          </li>
          <li>
            <strong className="text-zinc-300">RSSB</strong> pension and
            maternity contributions are modeled as employee payroll deductions
            after PAYE using the selected RSSB contribution salary. Pension
            coverage can use the 6% employee rate or the 12% voluntary-member
            rate.
          </li>
          <li>
            <strong className="text-zinc-300">Medical Scheme</strong> adds the
            7.5% employee contribution on the selected medical basic salary
            when RSSB medical coverage is selected.
          </li>
          <li>
            <strong className="text-zinc-300">CBHI</strong> is modeled at 0.5%
            of net salary after PAYE, pension, and maternity deductions.
          </li>
          <li>
            <strong className="text-zinc-300">Benefits in Kind</strong> add
            taxable employment income for PAYE: housing at 20%, motor vehicle
            access at 10%, plus any other entered taxable benefit value.
          </li>
        </ul>
      </div>
    </section>
  );
}
