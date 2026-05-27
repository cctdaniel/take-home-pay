"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
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
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  LUCalculatorInputs,
  LUContributionInputs,
  LUTaxClass,
} from "@/lib/countries/lu/types";
import { clampAmount } from "@/lib/utils";

const MAX_CHILDREN = 10;

const TAX_CLASS_OPTIONS: SelectOption<LUTaxClass>[] = [
  { value: "class1", label: "Class 1 - single" },
  { value: "class1a", label: "Class 1a - single parent / age 65+" },
  { value: "class2", label: "Class 2 - married / PACS collective" },
];

function clampAge(value: number) {
  return Math.min(Math.max(18, Math.floor(value)), 100);
}

function clampChildren(value: number) {
  return Math.min(Math.max(0, Math.floor(value)), MAX_CHILDREN);
}

export default function LUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<LUCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const pensionLimit = contributionLimits.retirementContribution?.limit ?? 0;

  const setContribution = (
    key: keyof LUContributionInputs,
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
            id="lu-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="lu-tax-class"
            label="Tax Class"
            value={inputs.taxClass}
            onChange={(taxClass) =>
              setInputs((current) => ({ ...current, taxClass }))
            }
            options={TAX_CLASS_OPTIONS}
            description="Class 1, 1a, and 2 use separate official ACD annual formula tables."
          />
          <NumberField
            id="lu-age"
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
                  taxClass:
                    current.taxClass === "class1" && nextAge >= 65
                      ? "class1a"
                      : current.taxClass,
                };
              })
            }
            description="Used to suggest class 1a when age 65+ applies; the selected class drives the calculation."
          />
          <NumberStepperField
            id="lu-children"
            label="Children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => {
                const nextChildren = clampChildren(numberOfChildren);

                return {
                  ...current,
                  numberOfChildren: nextChildren,
                  taxClass:
                    current.taxClass === "class1" && nextChildren > 0
                      ? "class1a"
                      : current.taxClass,
                };
              })
            }
            max={MAX_CHILDREN}
            description="Children are modeled through the selected tax class; separate family benefits are outside salary tax."
          />
          <BooleanSelectField
            id="lu-single-parent-credit"
            label="Single-Parent Tax Credit"
            value={inputs.claimSingleParentCredit}
            onChange={(claimSingleParentCredit) =>
              setInputs((current) => ({
                ...current,
                claimSingleParentCredit,
                taxClass:
                  claimSingleParentCredit && current.taxClass === "class1"
                    ? "class1a"
                    : current.taxClass,
              }))
            }
            trueLabel="Claim CIM"
            falseLabel="No"
            description="For eligible class 1a taxpayers with a child in the household and a child tax reduction."
          />
          {inputs.claimSingleParentCredit ? (
            <CurrencyAmountField
              id="lu-child-support-allowances"
              label="Child Support / Allowances Received"
              value={inputs.childSupportOrAllowancesReceived}
              onChange={(childSupportOrAllowancesReceived) =>
                setInputs((current) => ({
                  ...current,
                  childSupportOrAllowancesReceived: Math.max(
                    0,
                    childSupportOrAllowancesReceived,
                  ),
                }))
              }
              currency={currency}
              step={100}
              description="Annual maintenance, support, education, or similar allowances received for the child. Amounts above EUR 2,712 reduce the single-parent credit by 50%."
            />
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        pensionLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.retirementContribution?.name ??
              "Private pension savings contribution"
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
              "Deductible Luxembourg Article 111bis private pension contribution."
            }
          />
        ) : undefined
      }
      contributionsTitle="Luxembourg Deductions"
      contributionsDescription="Article 111bis private pension savings with the EUR 4,500 annual deduction cap"
      seoInfo={<LuxembourgTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Luxembourg resident employment income with official ACD
            formula tables for tax classes 1, 1a, and 2, the employment fund
            surcharge, refundable employee credits, and employee social-security
            contributions.
          </p>
          <p className="mt-2">
            Children and age help select the relevant class, but the class field
            is explicit because Luxembourg household status rules can depend on
            details beyond a salary calculator.
          </p>
          <p className="mt-2">
            Child benefits, commuting above the standard deduction, employer
            pension plans, exact payroll withholding timing, and non-resident
            treaty cases are not modeled as annual salary inputs here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function LuxembourgTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Luxembourg Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Tax Class</strong> selects the
            official annual formula table for class 1, class 1a, or class 2.
          </li>
          <li>
            <strong className="text-zinc-300">Employment Fund</strong> is
            included at 7%, with the official high-income 9% formula adjustment
            above the class threshold.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            include employee pension, health, and dependency insurance with the
            2026 social-security ceiling where applicable.
          </li>
          <li>
            <strong className="text-zinc-300">Single-Parent Credit</strong>{" "}
            models the CIM for eligible class 1a taxpayers with a child, using
            the income phase-out and maintenance/allowance reduction.
          </li>
          <li>
            <strong className="text-zinc-300">Private Pension</strong> reduces
            taxable income up to the EUR 4,500 Article 111bis annual cap.
          </li>
        </ul>
      </div>
    </section>
  );
}
