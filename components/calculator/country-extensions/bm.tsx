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
  BM_HEALTH_EMPLOYEE_HALF_STANDARD_PREMIUM_ANNUAL,
  BM_OCCUPATIONAL_PENSION_EMPLOYEE_RATE,
  BM_STANDARD_PREMIUM_RATE_MONTHLY_2026,
} from "@/lib/countries/bm/constants/tax-year-2026";
import type {
  BMCalculatorInputs,
  BMContributionInputs,
  BMOccupationalPensionTreatment,
} from "@/lib/countries/bm/types";
import { clampAmount } from "@/lib/utils";

export default function BermudaCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BMCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const healthInsuranceLimit =
    contributionLimits.insurancePremiums?.limit ?? 0;

  const setContribution = (
    key: keyof BMContributionInputs,
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
            id="bm-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="bm-payroll-tax-deducted"
            label="Employee Payroll Tax"
            value={inputs.payrollTaxDeducted}
            onChange={(payrollTaxDeducted) =>
              setInputs((current) => ({ ...current, payrollTaxDeducted }))
            }
            trueLabel="Deduct from pay"
            falseLabel="Employer absorbs"
            trueFirst
            description="Bermuda employers may deduct the employee portion, but the employer remains responsible for paying payroll tax."
          />
          <CurrencyAmountField
            id="bm-taxable-benefits-in-kind"
            label="Taxable Cash or In-Kind Benefits"
            value={inputs.taxableNonCashBenefits ?? 0}
            onChange={(taxableNonCashBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonCashBenefits: Math.max(0, taxableNonCashBenefits),
              }))
            }
            currency={currency}
            min={0}
            step={100}
            description="Annual taxable benefits paid in cash or in kind. Adds to Bermuda payroll-tax remuneration but not cash salary."
          />
          <BooleanSelectField
            id="bm-social-insurance-covered"
            label="Social Insurance"
            value={inputs.socialInsuranceCovered}
            onChange={(socialInsuranceCovered) =>
              setInputs((current) => ({ ...current, socialInsuranceCovered }))
            }
            trueLabel="Covered"
            falseLabel="Not deducted"
            trueFirst
            description="Use not deducted for exempt or non-covered cases such as over-pension-age employees."
          />
          <SelectField
            id="bm-occupational-pension"
            label="Occupational Pension"
            value={inputs.occupationalPensionTreatment}
            onChange={(occupationalPensionTreatment) =>
              setInputs((current) => ({
                ...current,
                occupationalPensionTreatment:
                  occupationalPensionTreatment as BMOccupationalPensionTreatment,
              }))
            }
            options={[
              {
                value: "employeeDeducted",
                label: "Employee pays 5%",
              },
              {
                value: "employerPaidEmployeeShare",
                label: "Employer pays employee share",
              },
              {
                value: "notCovered",
                label: "Not covered",
              },
            ]}
            description={`Eligible employees are modeled with the required ${(BM_OCCUPATIONAL_PENSION_EMPLOYEE_RATE * 100).toFixed(0)}% employee contribution unless the employer pays it.`}
          />
          <BooleanSelectField
            id="bm-non-working-spouse-health"
            label="Non-Working Spouse Health Cover"
            value={inputs.nonWorkingSpouseHealthCoverage}
            onChange={(nonWorkingSpouseHealthCoverage) =>
              setInputs((current) => ({
                ...current,
                nonWorkingSpouseHealthCoverage,
              }))
            }
            trueLabel="Include spouse"
            falseLabel="Employee only"
            description="Raises the health-insurance payroll deduction cap for a non-employed spouse when the employer must insure them."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        healthInsuranceLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.insurancePremiums?.name ??
              "Health insurance payroll deduction"
            }
            value={Math.min(
              inputs.contributions.insurancePremiums ?? 0,
              healthInsuranceLimit,
            )}
            onChange={(amount) => setContribution("insurancePremiums", amount)}
            max={healthInsuranceLimit}
            step={Math.max(1, Math.round(healthInsuranceLimit / 100))}
            currency={currency}
            description={contributionLimits.insurancePremiums?.description}
          />
        ) : undefined
      }
      contributionsTitle="Bermuda Payroll Deductions"
      contributionsDescription="Employee health-insurance deductions capped by the standard premium rate; occupational pension is selected above"
      infoCard={
        <InfoPanel title="Bermuda Payroll Scope">
          <p>
            Bermuda has no personal income tax, but employers may deduct the
            employee portion of payroll tax from salary. This model applies the
            April 2026 to March 2027 employee payroll-tax bands and a full-year
            employee social insurance deduction of BMD 37.65 per week when the
            relevant toggles are enabled.
          </p>
          <p className="mt-2">
            Taxable cash or in-kind benefits are entered separately because
            Bermuda payroll tax applies to taxable remuneration, while this
            page keeps cash salary as the take-home base.
          </p>
          <p className="mt-2">
            Eligible occupational-pension employees are modeled with the
            required 5% employee contribution unless you select that the
            employer pays the employee share. Health insurance is shown as a
            capped payroll deduction using the 2026 standard premium rate of
            BMD{" "}
            {BM_STANDARD_PREMIUM_RATE_MONTHLY_2026.toLocaleString("en-BM", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            per month.
          </p>
        </InfoPanel>
      }
      seoInfo={<BermudaTaxInfo />}
    />
  );
}

function BermudaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Bermuda Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - Bermuda
            does not impose personal income tax on individuals.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Payroll Tax</strong> -
            the employee portion is modeled with the April 2026 to March 2027
            marginal rates, capped at BMD 1,000,000 of annual remuneration.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Benefits</strong> -
            entered cash or in-kind benefits are added to payroll-tax
            remuneration but not to cash salary.
          </li>
          <li>
            <strong className="text-zinc-300">Social Insurance</strong> - a
            full-year employee deduction of BMD 37.65 per week is included.
          </li>
          <li>
            <strong className="text-zinc-300">Occupational Pension</strong> -
            eligible employees are modeled with a 5% employee contribution
            unless the employer pays that share.
          </li>
          <li>
            <strong className="text-zinc-300">Health Insurance</strong> -
            payroll deductions are capped at BMD{" "}
            {BM_HEALTH_EMPLOYEE_HALF_STANDARD_PREMIUM_ANNUAL.toLocaleString(
              "en-BM",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}{" "}
            per covered person annually, equal to half of the 2026 standard
            premium rate.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus employee payroll tax, selected payroll
            deductions, and employee social insurance.
          </li>
        </ul>
      </div>
    </section>
  );
}
