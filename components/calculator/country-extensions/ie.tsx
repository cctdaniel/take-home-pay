"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
  NumberStepperField,
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
  IE_MY_FUTURE_FUND_2026,
  IE_PENSION_EARNINGS_CAP,
} from "@/lib/countries/ie/constants/tax-year-2026";
import type {
  IECalculatorInputs,
  IEContributionInputs,
  IERetirementScheme,
  IESarpRegime,
  IETaxStatus,
} from "@/lib/countries/ie/types";
import { formatCurrency } from "@/lib/format";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function taxStatusAllowsHomeCarer(taxStatus: IETaxStatus) {
  return taxStatus !== "single";
}

const SARP_OPTIONS: Array<{ value: IESarpRegime; label: string }> = [
  { value: "none", label: "No SARP relief" },
  { value: "arrived_2023_to_2025", label: "SARP arrival 2023-2025" },
  { value: "arrived_2026_onwards", label: "SARP arrival 2026 onwards" },
];

export default function IECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<IECalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const pensionContributionLimit =
    contributionLimits.pensionContribution.limit ?? 0;
  const rentPaidLimit = contributionLimits.qualifyingRentPaid.limit ?? 0;

  const setContribution = (
    key: keyof IEContributionInputs,
    value: number,
    max = Infinity,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(value, max),
      },
    }));
  };

  const setGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs = { ...current, grossSalary };
      const nextLimits =
        getCountryCalculator(country).getContributionLimits(nextInputs);

      return {
        ...nextInputs,
        contributions: {
          ...current.contributions,
          pensionContribution: clampAmount(
            current.contributions.pensionContribution,
            nextLimits.pensionContribution.limit,
          ),
          qualifyingRentPaid: clampAmount(
            current.contributions.qualifyingRentPaid,
            nextLimits.qualifyingRentPaid.limit,
          ),
        },
      };
    });
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
            id="ie-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="ie-taxable-benefits-in-kind"
            label="Taxable Benefit-in-Kind"
            value={inputs.taxableBenefitsInKind}
            onChange={(taxableBenefitsInKind) =>
              setInputs((current) => ({
                ...current,
                taxableBenefitsInKind: Math.max(0, taxableBenefitsInKind),
              }))
            }
            currency={currency}
            step={100}
            description="Enter the annual cash-equivalent value from payroll or Revenue rules; it increases PAYE, PRSI, and USC bases but is not cash salary."
          />
          <NumberField
            id="ie-age"
            label="Age"
            value={inputs.age}
            min={16}
            max={99}
            fallbackValue={35}
            onChange={(age) =>
              setInputs((current) => {
                const nextInputs = { ...current, age };
                const nextLimit =
                  getCountryCalculator(country).getContributionLimits(
                    nextInputs,
                  ).pensionContribution.limit;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    pensionContribution: clampAmount(
                      current.contributions.pensionContribution,
                      nextLimit,
                    ),
                  },
                };
              })
            }
            description="Controls Revenue's pension tax-relief percentage limit."
          />
          <SelectField
            id="ie-tax-status"
            label="Tax status"
            value={inputs.taxStatus}
            onChange={(taxStatus) =>
              setInputs((current) => {
                const nextTaxStatus = taxStatus as IETaxStatus;
                const nextInputs = {
                  ...current,
                  taxStatus: nextTaxStatus,
                  hasSinglePersonChildCarerCredit:
                    nextTaxStatus === "single"
                      ? current.hasSinglePersonChildCarerCredit
                      : false,
                  hasHomeCarerTaxCredit: taxStatusAllowsHomeCarer(nextTaxStatus)
                    ? current.hasHomeCarerTaxCredit
                    : false,
                };
                const nextLimit =
                  getCountryCalculator(country).getContributionLimits(
                    nextInputs,
                  ).qualifyingRentPaid.limit;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    qualifyingRentPaid: clampAmount(
                      current.contributions.qualifyingRentPaid,
                      nextLimit,
                    ),
                  },
                };
              })
            }
            options={[
              { value: "single", label: "Single employee" },
              {
                value: "married_one_income",
                label: "Married/civil partners, one income",
              },
              {
                value: "married_two_incomes",
                label: "Married/civil partners, two incomes",
              },
            ]}
            description="Selects Ireland's 2026 standard-rate band and personal/PAYE credits."
          />
          <BooleanSelectField
            id="ie-single-parent-credit"
            label="Single Person Child Carer Credit"
            value={inputs.hasSinglePersonChildCarerCredit}
            onChange={(hasSinglePersonChildCarerCredit) =>
              setInputs((current) => ({
                ...current,
                hasSinglePersonChildCarerCredit:
                  current.taxStatus === "single"
                    ? hasSinglePersonChildCarerCredit
                    : false,
              }))
            }
            trueLabel="Claimed"
            falseLabel="Not claimed"
            description="For qualifying single parents/carers: adds the 2026 credit and higher single rate band."
          />
          <BooleanSelectField
            id="ie-reduced-usc"
            label="Reduced USC"
            value={inputs.hasReducedUSC}
            onChange={(hasReducedUSC) =>
              setInputs((current) => ({ ...current, hasReducedUSC }))
            }
            trueLabel="Age 70+ / full medical card"
            falseLabel="Standard USC"
            description="Applies only when annual income does not exceed EUR 60,000."
          />
          <SelectField
            id="ie-sarp-regime"
            label="SARP Relief"
            value={inputs.sarpRegime ?? "none"}
            onChange={(sarpRegime) =>
              setInputs((current) => ({ ...current, sarpRegime }))
            }
            options={SARP_OPTIONS}
            description="Special Assignee Relief Programme, income-tax only; pension relief reduces the SARP base, while USC and PRSI stay on full salary."
          />
          {taxStatusAllowsHomeCarer(inputs.taxStatus) && (
            <>
              <BooleanSelectField
                id="ie-home-carer-credit"
                label="Home Carer Tax Credit"
                value={inputs.hasHomeCarerTaxCredit}
                onChange={(hasHomeCarerTaxCredit) =>
                  setInputs((current) => ({
                    ...current,
                    hasHomeCarerTaxCredit,
                  }))
                }
                trueLabel="Claimed"
                falseLabel="Not claimed"
                description="Models the 2026 Home Carer credit and income taper."
              />
              <CurrencyAmountField
                id="ie-home-carer-income"
                label="Home carer income"
                value={inputs.homeCarerIncome}
                onChange={(homeCarerIncome) =>
                  setInputs((current) => ({
                    ...current,
                    homeCarerIncome: clampAmount(homeCarerIncome, 11_100),
                  }))
                }
                currency={currency}
                max={11_100}
                step={100}
                description="Credit tapers after EUR 7,200 and is nil at EUR 11,100."
              />
            </>
          )}
          <NumberStepperField
            id="ie-dependent-relatives"
            label="Dependent relatives"
            value={inputs.numberOfDependentRelatives}
            onChange={(numberOfDependentRelatives) =>
              setInputs((current) => ({
                ...current,
                numberOfDependentRelatives,
              }))
            }
            min={0}
            max={6}
            description="Applies the 2026 dependent relative credit per eligible relative."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <SelectField
            id="ie-retirement-scheme"
            label="Retirement scheme"
            value={inputs.retirementScheme}
            onChange={(retirementScheme) =>
              setInputs((current) => ({
                ...current,
                retirementScheme: retirementScheme as IERetirementScheme,
                contributions: {
                  ...current.contributions,
                  pensionContribution:
                    retirementScheme === "private_pension"
                      ? current.contributions.pensionContribution
                      : 0,
                },
              }))
            }
            options={[
              { value: "none", label: "No employee retirement deduction" },
              { value: "private_pension", label: "Private pension / AVC / PRSA" },
              { value: "my_future_fund", label: "MyFutureFund auto-enrolment" },
            ]}
            description="Private pension relief and MyFutureFund are modeled differently under Irish rules."
          />
          {inputs.retirementScheme === "private_pension" && (
            <ContributionSlider
              label="Private pension / AVC contribution"
              value={Math.min(
                inputs.contributions.pensionContribution,
                pensionContributionLimit,
              )}
              onChange={(pensionContribution) =>
                setContribution(
                  "pensionContribution",
                  pensionContribution,
                  pensionContributionLimit,
                )
              }
              max={pensionContributionLimit}
              step={100}
              currency={currency}
              description={`Revenue age-band cap: ${(result.breakdown.type === "IE" ? result.breakdown.pensionReliefPercent * 100 : 0).toFixed(0)}% of earnings up to ${formatCurrency(IE_PENSION_EARNINGS_CAP, currency)}.`}
            />
          )}
          {inputs.retirementScheme === "my_future_fund" &&
            result.breakdown.type === "IE" && (
              <div className="space-y-2 rounded-lg bg-zinc-800/50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Employee deduction:</span>
                  <span className="text-zinc-200">
                    {formatCurrency(
                      result.breakdown.myFutureFund.employeeContribution,
                      currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Employer contribution:</span>
                  <span className="text-zinc-200">
                    {formatCurrency(
                      result.breakdown.myFutureFund.employerContribution,
                      currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">State top-up:</span>
                  <span className="text-zinc-200">
                    {formatCurrency(
                      result.breakdown.myFutureFund.stateTopUp,
                      currency,
                    )}
                  </span>
                </div>
              </div>
            )}
          <ContributionSlider
            label="Qualifying rent paid"
            value={Math.min(inputs.contributions.qualifyingRentPaid, rentPaidLimit)}
            onChange={(qualifyingRentPaid) =>
              setContribution("qualifyingRentPaid", qualifyingRentPaid, rentPaidLimit)
            }
            max={rentPaidLimit}
            step={100}
            currency={currency}
            description={`Generates the 20% Rent Tax Credit up to the 2026 ${inputs.taxStatus === "single" ? "single" : "joint"} cap.`}
          />
          <CurrencyAmountField
            id="ie-health-expenses"
            label="Qualifying health expenses"
            value={inputs.contributions.healthExpenses}
            onChange={(healthExpenses) =>
              setContribution("healthExpenses", healthExpenses)
            }
            currency={currency}
            step={50}
            description="General qualifying health expenses receive 20% income-tax relief; nursing-home higher-rate relief is not modeled here."
          />
          <ContributionSlider
            label="Revenue flat-rate expenses"
            value={inputs.contributions.flatRateExpenses}
            onChange={(flatRateExpenses) =>
              setContribution("flatRateExpenses", flatRateExpenses, inputs.grossSalary)
            }
            max={inputs.grossSalary}
            step={10}
            currency={currency}
            description="Enter the Revenue-approved allowance for your occupation, if applicable."
          />
          {inputs.retirementScheme === "my_future_fund" && (
            <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
              MyFutureFund 2026-28 contributions are{" "}
              {(IE_MY_FUTURE_FUND_2026.employeeRate * 100).toFixed(1)}% from
              the employee, matched by the employer, plus a{" "}
              {(IE_MY_FUTURE_FUND_2026.stateRate * 100).toFixed(1)}% State
              top-up on earnings up to{" "}
              {formatCurrency(IE_MY_FUTURE_FUND_2026.earningsCap, currency)}.
            </p>
          )}
        </div>
      }
      contributionsTitle="Retirement, Credits & Deduction Inputs"
      contributionsDescription="Ireland-specific pension, MyFutureFund, rent, health, and employment-expense reliefs"
      seoInfo={<IrelandTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in
            Ireland, including PAYE income tax, 2026 standard-rate bands,
            employee PRSI Class A, Universal Social Charge, standard credits,
            selected family credits, and common claimable employee reliefs.
            SARP can be selected for qualifying inbound assignees and reduces
            income tax only. Taxable benefit-in-kind values can be entered as
            annual cash-equivalent payroll amounts.
          </p>
          <p className="mt-2">
            Pension contributions use Revenue&apos;s age-related limits and the
            EUR 115,000 earnings cap. MyFutureFund is modeled as a post-tax
            payroll deduction with employer and State contributions shown for
            context.
          </p>
          <p className="mt-2">
            Benefit-in-kind valuation worksheets, emergency or week-one payroll
            timing, SARP employer certification timing, mortgage interest
            credit, nursing-home higher-rate relief, and exact spouse credit
            allocation require taxpayer-specific Revenue records and are not
            hidden as generic inputs.
          </p>
        </InfoPanel>
      }
    />
  );
}

function IrelandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Ireland Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">PAYE Income Tax</strong> uses
            the selected 2026 Irish standard-rate band, including the Single
            Person Child Carer band when selected, before income above the band
            is taxed at 40%.
          </li>
          <li>
            <strong className="text-zinc-300">Tax Credits</strong> include the
            personal and PAYE credits plus modeled rent, health expense, Home
            Carer, dependent relative, and Single Person Child Carer credits.
          </li>
          <li>
            <strong className="text-zinc-300">SARP Relief</strong> disregards
            30% of qualifying employment income above the selected Revenue
            threshold for income tax only, after modeled private pension relief.
            USC and PRSI remain based on full salary.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Benefit-in-Kind</strong>{" "}
            is added to the PAYE, PRSI, and USC bases when entered, while net
            cash pay still starts from salary because the benefit is non-cash.
          </li>
          <li>
            <strong className="text-zinc-300">Pension Relief</strong> applies
            Revenue&apos;s age-related percentage limit and the EUR 115,000
            earnings cap to private pension, AVC, or PRSA-style contributions.
          </li>
          <li>
            <strong className="text-zinc-300">PRSI and USC</strong> are payroll
            deductions. USC keeps the EUR 13,000 exemption and supports the
            reduced USC rate where income is within the EUR 60,000 limit.
          </li>
          <li>
            <strong className="text-zinc-300">MyFutureFund</strong> is modeled
            as a net-pay employee deduction with employer and State top-ups
            shown separately because it does not work like pension tax relief.
          </li>
        </ul>
      </div>
    </section>
  );
}
