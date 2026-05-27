"use client";

import { GRTaxOptions } from "@/components/calculator/gr-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { GRCalculator } from "@/lib/countries/gr";
import type {
  GRCalculatorInputs,
  GRTaxRegime,
} from "@/lib/countries/gr/types";
import { clampAmount } from "@/lib/utils";

export default function GRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<GRCalculatorInputs>(country);
  const contributionLimits = GRCalculator.getContributionLimits(inputs);
  const taxRegime = inputs.taxRegime ?? "ordinary";
  const isArticle5C = taxRegime === "article_5c_new_resident";
  const occupationalPensionLimit =
    contributionLimits.occupationalPensionContribution?.limit ?? 0;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <GRTaxOptions
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          taxRegime={taxRegime}
          onTaxRegimeChange={(nextTaxRegime: GRTaxRegime) =>
            setInputs((current) => ({
              ...current,
              taxRegime: nextTaxRegime,
              residencyType:
                nextTaxRegime === "article_5c_new_resident"
                  ? "resident"
                  : current.residencyType,
            }))
          }
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => ({
              ...current,
              residencyType,
              taxRegime:
                residencyType === "non_resident" ? "ordinary" : current.taxRegime,
              contributions:
                residencyType === "non_resident"
                  ? {
                      ...current.contributions,
                      occupationalPensionContribution: 0,
                    }
                  : current.contributions,
            }))
          }
          age={inputs.age}
          onAgeChange={(age) =>
            setInputs((current) => ({ ...current, age }))
          }
          numberOfDependents={inputs.numberOfDependents}
          onNumberOfDependentsChange={(numberOfDependents) =>
            setInputs((current) => ({ ...current, numberOfDependents }))
          }
          taxableBenefitsInKind={inputs.taxableBenefitsInKind}
          onTaxableBenefitsInKindChange={(taxableBenefitsInKind) =>
            setInputs((current) => ({
              ...current,
              taxableBenefitsInKind: Math.max(0, taxableBenefitsInKind),
            }))
          }
          currency={currency}
        />
      }
      contributions={
        occupationalPensionLimit > 0 ? (
          <div className="space-y-6">
            <ContributionSlider
              label="Occupational Pension / Group Pension Plan"
              description="Resident employee contributions can reduce taxable employment income, capped at 20% of gross salary."
              value={Math.min(
                inputs.contributions.occupationalPensionContribution,
                occupationalPensionLimit,
              )}
              onChange={(occupationalPensionContribution) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    occupationalPensionContribution: clampAmount(
                      occupationalPensionContribution,
                      occupationalPensionLimit,
                    ),
                  },
                }))
              }
              max={occupationalPensionLimit}
              currency={currency}
            />
            <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
              Applies to qualifying occupational pension funds or group pension
              insurance plans. Mandatory e-EFKA employee insurance is calculated
              automatically.
            </p>
          </div>
        ) : undefined
      }
      contributionsTitle="Greece Occupational Pension Deduction"
      contributionsDescription="Resident TEA or group pension contributions that reduce taxable employment income"
      contributionsEmptyState="Occupational pension deductions are modeled for Greek tax residents only; non-resident salary uses the employment scale without this resident deduction and would require separate resident eligibility facts."
      seoInfo={<GRTaxInfo />}
      infoCard={
        <InfoPanel title="Greece Payroll Scope">
          <p>
          This models Greece employment salary with resident or non-resident
            treatment, age and dependent-child adjustments, Article 5C
            new-tax-resident relief when selected, e-EFKA employee
            contributions, taxable benefits in kind, and the selected
            occupational pension contribution.
          </p>
          <p className="mt-2">
            Employer e-EFKA shares are shown in results where available but do
            not reduce employee take-home pay. The Article 5C control applies
            only to eligible Greek-source employment income for approved new
            Greek tax residents and does not model Article 5A foreign-income
            flat tax, Article 5B foreign-pension tax, benefit valuation
            worksheets, freelancer regimes, or month-specific payroll timing.
          </p>
          {isArticle5C && (
            <p className="mt-2 text-emerald-300/90">
              Article 5C is selected: 50% of eligible employment income after
              employee deductions is exempted from Greek income tax, while
              e-EFKA remains based on full insured salary.
            </p>
          )}
        </InfoPanel>
      }
    />
  );
}

function GRTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Greece</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Employment Income Tax</strong> –
          Progressive 2026 rates from 0% to 44%, with child and youth adjustments
        </li>
        <li>
          <strong className="text-zinc-300">Dependent Children</strong> –
          Lower rates apply in selected brackets, with four or more children
          reaching 0% on income up to EUR 20,000
        </li>
        <li>
          <strong className="text-zinc-300">Youth Rates</strong> – Taxpayers up
          to age 25 pay 0% on the first EUR 20,000; ages 26-30 receive a 9%
          second bracket
        </li>
        <li>
          <strong className="text-zinc-300">Employment Tax Reduction</strong> –
          EUR 777 base reduction with no children, higher with children, tapered
          above EUR 12,000 of taxable employment income
        </li>
        <li>
          <strong className="text-zinc-300">e-EFKA Social Insurance</strong> –
          13.37% employee contribution for ordinary salaried employees, capped
          at EUR 7,761.94 per month of insurable earnings
        </li>
        <li>
          <strong className="text-zinc-300">Occupational Pension</strong> –
          Qualifying TEA or group pension plan contributions can reduce taxable
          employment income, capped at 20% of gross salary
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2026 (No Dependent Children)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>EUR 0 – EUR 10,000: 9%</li>
        <li>EUR 10,001 – EUR 20,000: 20%</li>
        <li>EUR 20,001 – EUR 30,000: 26%</li>
        <li>EUR 30,001 – EUR 40,000: 34%</li>
        <li>EUR 40,000.01 – EUR 60,000: 39%</li>
        <li>Above EUR 60,000: 44%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Social Insurance Assumptions
      </h4>
      <p className="text-zinc-400 text-sm">
        Employee e-EFKA contributions are deducted from gross employment income
        before income tax. Employer contributions are shown for reference only
        and are not deducted from take-home pay. This calculator uses the
        ordinary salaried employee package; heavy work, occupational-risk,
        lawyer/engineer, doctor, and working-pensioner categories can differ.
      </p>
    </div>
  );
}

function GRTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Greece Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <GRTaxInfoContent />
      </div>
    </section>
  );
}
