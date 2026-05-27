"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
import { ContributionSlider } from "@/components/ui/contribution-slider";
import {
  getCountryCalculator,
} from "@/lib/countries/registry";
import {
  JP_DONATION_DEDUCTION_LIMITS,
  JP_INCOME_TAX_DEPENDENT_DEDUCTIONS,
  JP_INCOME_TAX_SPOUSE_DEDUCTION,
  JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS,
} from "@/lib/countries/jp/constants/tax-parameters-2026";
import type {
  JPCalculatorInputs,
  JPContributionInputs,
  JPDonationType,
  JPIdecoCategory,
  JPSpouseDeductionType,
} from "@/lib/countries/types";
import { clampAmount, clampCount } from "@/lib/utils";

const MAX_DEPENDENTS = 10;

const SPOUSE_OPTIONS: SelectOption<JPSpouseDeductionType>[] = [
  { value: "none", label: "No spouse deduction" },
  { value: "ordinary", label: "Ordinary qualifying spouse" },
  { value: "elderly", label: "Elderly qualifying spouse (70+)" },
];

const IDECO_OPTIONS: SelectOption<JPIdecoCategory>[] = [
  {
    value: "employee_no_corporate_pension",
    label: "Employee, no corporate pension",
  },
  {
    value: "employee_with_corporate_pension",
    label: "Employee with corporate pension",
  },
];

const DONATION_OPTIONS: SelectOption<JPDonationType>[] = [
  { value: "none", label: "No donation deduction" },
  { value: "specified", label: "Specified donation deduction" },
  { value: "furusato", label: "Furusato nozei / municipal donation" },
];

function clampDependents(value: number) {
  return Math.min(Math.max(0, Math.floor(value)), MAX_DEPENDENTS);
}

export default function JPCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<JPCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const idecoLimit = contributionLimits.idecoContribution?.limit ?? 0;
  const medicalExpenseThreshold =
    result.breakdown.type === "JP" ? result.breakdown.medicalExpenseThreshold : 0;
  const medicalExpenseInputLimit =
    JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS.ordinaryDeductionMax +
    medicalExpenseThreshold +
    Math.max(0, inputs.contributions.medicalExpenseReimbursements ?? 0);
  const sliderContributionKeys: Array<keyof JPContributionInputs> = [
    "idecoContribution",
    "lifeInsurancePremiums",
    "careMedicalInsurancePremiums",
    "privatePensionInsurancePremiums",
    "earthquakeInsurancePremiums",
    "qualifiedDonations",
  ];

  const setContribution = (
    key: keyof JPContributionInputs,
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

  const setTaxOnlyAmount = (
    key: "medicalExpenses" | "medicalExpenseReimbursements",
    amount: number,
    max = Number.POSITIVE_INFINITY,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.min(Math.max(0, amount), max),
      },
    }));
  };

  const renderContributionSlider = (key: keyof JPContributionInputs) => {
    if (key === "qualifiedDonations" && inputs.donationType === "none") {
      return null;
    }

    const limit = contributionLimits[key]?.limit ?? 0;

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key]?.name ?? key}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={key === "idecoContribution" ? 12_000 : 5_000}
        currency={currency}
        description={contributionLimits[key]?.description}
      />
    );
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
            id="jp-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="jp-spouse"
            label="Spouse Deduction"
            value={inputs.spouseDeductionType}
            onChange={(spouseDeductionType) =>
              setInputs((current) => ({ ...current, spouseDeductionType }))
            }
            options={SPOUSE_OPTIONS}
            description={`Full ordinary spouse deduction is JPY ${JP_INCOME_TAX_SPOUSE_DEDUCTION.ordinary[0].toLocaleString()} before taxpayer income phase-out.`}
          />
          <NumberStepperField
            id="jp-ordinary-dependents"
            label="Ordinary Dependents"
            value={inputs.numberOfOrdinaryDependents}
            onChange={(numberOfOrdinaryDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfOrdinaryDependents: clampDependents(
                  numberOfOrdinaryDependents,
                ),
              }))
            }
            min={0}
            max={MAX_DEPENDENTS}
            description={`Age 16-18 or 23-69; JPY ${JP_INCOME_TAX_DEPENDENT_DEDUCTIONS.ordinary.toLocaleString()} income-tax deduction each.`}
          />
          <NumberStepperField
            id="jp-specified-dependents"
            label="Specified Dependents"
            value={inputs.numberOfSpecifiedDependents}
            onChange={(numberOfSpecifiedDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfSpecifiedDependents: clampDependents(
                  numberOfSpecifiedDependents,
                ),
                hasIncomeAdjustmentDeduction:
                  numberOfSpecifiedDependents > 0 ||
                  current.hasIncomeAdjustmentDeduction,
              }))
            }
            min={0}
            max={MAX_DEPENDENTS}
            description={`Age 19-22; JPY ${JP_INCOME_TAX_DEPENDENT_DEDUCTIONS.specified.toLocaleString()} income-tax deduction each.`}
          />
          <NumberStepperField
            id="jp-elderly-dependents"
            label="Elderly Dependents"
            value={inputs.numberOfElderlyDependents}
            onChange={(numberOfElderlyDependents) =>
              setInputs((current) => ({
                ...current,
                numberOfElderlyDependents: clampDependents(
                  numberOfElderlyDependents,
                ),
              }))
            }
            min={0}
            max={MAX_DEPENDENTS}
            description={`Age 70+ non-cohabiting; JPY ${JP_INCOME_TAX_DEPENDENT_DEDUCTIONS.elderly.toLocaleString()} income-tax deduction each.`}
          />
          <NumberStepperField
            id="jp-cohabiting-elderly-parents"
            label="Live-In Elderly Parents"
            value={inputs.numberOfCohabitingElderlyParents}
            onChange={(numberOfCohabitingElderlyParents) =>
              setInputs((current) => ({
                ...current,
                numberOfCohabitingElderlyParents: clampDependents(
                  numberOfCohabitingElderlyParents,
                ),
              }))
            }
            min={0}
            max={MAX_DEPENDENTS}
            description={`Age 70+ parent/grandparent living with you; JPY ${JP_INCOME_TAX_DEPENDENT_DEDUCTIONS.cohabitingElderlyParent.toLocaleString()} income-tax deduction each.`}
          />
          <BooleanSelectField
            id="jp-income-adjustment"
            label="Income Adjustment Deduction"
            value={inputs.hasIncomeAdjustmentDeduction}
            onChange={(hasIncomeAdjustmentDeduction) =>
              setInputs((current) => ({
                ...current,
                hasIncomeAdjustmentDeduction,
              }))
            }
            trueLabel="Eligible"
            falseLabel="Not eligible"
            description="For salary over JPY 8.5M with a dependent under 23 or qualifying special disability case."
          />
          <SelectField
            id="jp-ideco-category"
            label="iDeCo Category"
            value={inputs.idecoCategory}
            onChange={(idecoCategory) =>
              setInputs((current) => {
                const limit =
                  getCountryCalculator(country).getContributionLimits({
                    ...current,
                    idecoCategory,
                  }).idecoContribution?.limit ?? 0;

                return {
                  ...current,
                  idecoCategory,
                  contributions: {
                    ...current.contributions,
                    idecoContribution: Math.min(
                      current.contributions.idecoContribution,
                      limit,
                    ),
                  },
                };
              })
            }
            options={IDECO_OPTIONS}
            description="Selects the modeled employee iDeCo monthly contribution cap."
          />
          <SelectField
            id="jp-donation-type"
            label="Donation Deduction"
            value={inputs.donationType}
            onChange={(donationType) =>
              setInputs((current) => {
                const nextInputs = {
                  ...current,
                  donationType,
                };
                const nextLimit =
                  getCountryCalculator(country).getContributionLimits(
                    nextInputs,
                  ).qualifiedDonations?.limit ?? 0;

                return {
                  ...nextInputs,
                  contributions: {
                    ...current.contributions,
                    qualifiedDonations:
                      donationType === "none"
                        ? 0
                        : Math.min(
                            current.contributions.qualifiedDonations ?? 0,
                            nextLimit,
                          ),
                  },
                };
              })
            }
            options={DONATION_OPTIONS}
            description={`Specified donations are capped at ${(JP_DONATION_DEDUCTION_LIMITS.incomeTaxTotalIncomeLimitRate * 100).toFixed(0)}% of total income, minus the JPY ${JP_DONATION_DEDUCTION_LIMITS.donationFloor.toLocaleString()} floor; furusato also applies resident-tax credits.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        idecoLimit > 0 ? (
          <div className="space-y-6">
            {sliderContributionKeys.map(renderContributionSlider)}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-sm font-medium text-zinc-300">
                Medical and Donation Deductions
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Ordinary medical expenses are reduced by reimbursements and the
                lower of JPY{" "}
                {JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS.thresholdFixedAmount.toLocaleString()}{" "}
                or 5% of income, then capped at JPY{" "}
                {JP_MEDICAL_EXPENSE_DEDUCTION_LIMITS.ordinaryDeductionMax.toLocaleString()}
                . Donation amounts use the NTA JPY{" "}
                {JP_DONATION_DEDUCTION_LIMITS.donationFloor.toLocaleString()}{" "}
                floor; furusato nozei also models the resident-tax basic and
                special credits.
              </p>
            </div>
            <CalculatorFieldGrid columns={2}>
              <ContributionSlider
                label="Annual Medical Expenses"
                value={Math.min(
                  inputs.contributions.medicalExpenses ?? 0,
                  medicalExpenseInputLimit,
                )}
                onChange={(amount) =>
                  setTaxOnlyAmount(
                    "medicalExpenses",
                    amount,
                    medicalExpenseInputLimit,
                  )
                }
                max={medicalExpenseInputLimit}
                currency={currency}
                step={10_000}
                description="Qualified medical expenses paid for you or eligible relatives; the modeled deduction reaches the NTA JPY 2,000,000 cap after reimbursements and the income-based floor."
              />
              <CurrencyAmountField
                id="jp-medical-reimbursements"
                label="Insurance Reimbursements"
                value={inputs.contributions.medicalExpenseReimbursements ?? 0}
                onChange={(amount) =>
                  setTaxOnlyAmount("medicalExpenseReimbursements", amount)
                }
                currency={currency}
                step={10_000}
                description="Insurance benefits or reimbursements that reduce the medical expense deduction."
              />
            </CalculatorFieldGrid>
          </div>
        ) : undefined
      }
      contributionsTitle="Japan Year-End Deductions"
      contributionsDescription="iDeCo plus NTA insurance, medical expense, and qualified donation deductions; iDeCo and donations reduce modeled cash"
      seoInfo={<JapanTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Japan resident salary with the current NTA employment
            income deduction, 2025+ basic deduction schedule, national income
            tax, 2.1% reconstruction surtax, local resident tax proxy, and
            employee social insurance.
          </p>
          <p className="mt-2">
            Spouse and dependent fields apply the modeled national income-tax
            deductions and lower resident-tax deduction amounts. The high-income
            salary adjustment field covers the JPY 8.5M+ rule for a dependent
            under 23 or qualifying special disability case.
          </p>
          <p className="mt-2">
            New-system life, care/medical, and private-pension insurance
            premium deductions, earthquake insurance, and ordinary medical
            expense deductions are modeled for both national income tax and the
            resident-tax proxy. Qualified donations are modeled as a national
            income-tax deduction, and furusato nozei additionally applies the
            10% resident-tax basic credit and the special credit cap.
          </p>
          <p className="mt-2">
            Health-insurance prefecture rates, age-40 care insurance, bonus
            insurance caps, local per-capita variations, NTA housing-loan
            credit worksheets/certificates, and exact prior-year resident-tax
            timing are not yet modeled as salary inputs.
          </p>
        </InfoPanel>
      }
    />
  );
}

function JapanTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Japan Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Employment Income</strong> uses
            the NTA salary-income deduction table, including the 2025+ minimum
            deduction update.
          </li>
          <li>
            <strong className="text-zinc-300">Personal Deductions</strong>{" "}
            include the phased basic deduction plus selected spouse and
            dependent deductions.
          </li>
          <li>
            <strong className="text-zinc-300">Income Tax</strong> applies the
            5% to 45% national tax table and the 2.1% special reconstruction
            surtax.
          </li>
          <li>
            <strong className="text-zinc-300">Resident Tax</strong> uses a 10%
            income levy proxy with the lower resident-tax personal deduction
            amounts and modeled per-capita amount.
          </li>
          <li>
            <strong className="text-zinc-300">iDeCo</strong> is deducted up to
            the selected employee monthly cap and also reduces take-home cash.
          </li>
          <li>
            <strong className="text-zinc-300">Year-End Deductions</strong>{" "}
            include NTA life-insurance, earthquake-insurance, and ordinary
            medical-expense deduction formulas, with resident-tax deduction
            amounts calculated separately where they differ.
          </li>
          <li>
            <strong className="text-zinc-300">Donations</strong> model
            specified-donation income deductions and furusato nozei resident-tax
            credits using the NTA JPY{" "}
            {JP_DONATION_DEDUCTION_LIMITS.donationFloor.toLocaleString()}{" "}
            floor and 20% special-credit cap on the resident-tax income levy.
          </li>
        </ul>
      </div>
    </section>
  );
}
