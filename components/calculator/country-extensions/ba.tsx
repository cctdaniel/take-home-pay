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
import type { BAEntity, BACalculatorInputs } from "@/lib/countries/ba/types";

const ENTITY_OPTIONS: SelectOption<BAEntity>[] = [
  { value: "fbih", label: "Federation of BiH" },
  { value: "rs", label: "Republika Srpska" },
  { value: "bd", label: "Brcko District" },
];

export default function BosniaCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BACalculatorInputs>(country);
  const contributionLimits = Object.entries(
    getCountryCalculator(country).getContributionLimits(inputs),
  ).filter(([, limit]) => limit.limit > 0);
  const contributionValues = inputs.contributions as unknown as Record<
    string,
    number
  >;
  const setContribution = (
    key: keyof BACalculatorInputs["contributions"],
    value: number,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.max(0, value),
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
            id="ba-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="ba-entity"
            label="Tax Jurisdiction"
            value={inputs.entity}
            onChange={(entity) =>
              setInputs((current) => ({ ...current, entity }))
            }
            options={ENTITY_OPTIONS}
            description="Entity rules change income tax, allowances, and payroll contribution treatment."
          />
          {inputs.entity === "fbih" ? (
            <>
              <BooleanSelectField
                id="ba-fbih-spouse"
                label="Dependent Spouse"
                value={inputs.hasDependentSpouse}
                onChange={(hasDependentSpouse) =>
                  setInputs((current) => ({
                    ...current,
                    hasDependentSpouse,
                  }))
                }
                trueLabel="Claim"
                falseLabel="No claim"
                description="FBiH spouse allowance of BAM 150 per month."
              />
              <NumberStepperField
                id="ba-fbih-children"
                label="Dependent Children"
                value={inputs.dependentChildren}
                min={0}
                max={10}
                onChange={(dependentChildren) =>
                  setInputs((current) => ({
                    ...current,
                    dependentChildren: Math.max(0, dependentChildren),
                  }))
                }
                description="FBiH monthly child allowances: BAM 150 first, BAM 270 second, BAM 90 each additional child."
              />
              <NumberStepperField
                id="ba-fbih-parents"
                label="Dependent Parents"
                value={inputs.dependentParents}
                min={0}
                max={4}
                onChange={(dependentParents) =>
                  setInputs((current) => ({
                    ...current,
                    dependentParents: Math.max(0, dependentParents),
                  }))
                }
                description="FBiH parent allowance of BAM 90 per month per eligible parent."
              />
            </>
          ) : null}
          {inputs.entity === "rs" || inputs.entity === "bd" ? (
            <NumberStepperField
              id="ba-other-dependents"
              label="Dependent Family Members"
              value={inputs.otherDependents}
              min={0}
              max={10}
              onChange={(otherDependents) =>
                setInputs((current) => ({
                  ...current,
                  otherDependents: Math.max(0, otherDependents),
                }))
              }
              description={
                inputs.entity === "rs"
                  ? "RS allowance of BAM 900 annually per dependent family member."
                  : "Brcko allowance of BAM 3,000 annually per dependent or qualifying lifelong-aliment recipient."
              }
            />
          ) : null}
          {inputs.entity === "bd" ? (
            <>
              <NumberField
                id="ba-bd-disability-percent"
                label="Disability Percentage"
                value={inputs.bdDisabilityPercent}
                min={0}
                max={100}
                step={20}
                onChange={(bdDisabilityPercent) =>
                  setInputs((current) => ({
                    ...current,
                    bdDisabilityPercent,
                  }))
                }
                description="Brcko deduction is 10% of the personal allowance for every determined 20% disability."
              />
              <BooleanSelectField
                id="ba-bd-permanent-disability"
                label="Permanent Disability"
                value={inputs.bdPermanentDisability}
                onChange={(bdPermanentDisability) =>
                  setInputs((current) => ({
                    ...current,
                    bdPermanentDisability,
                  }))
                }
                trueLabel="Claim"
                falseLabel="No claim"
                description="Adds the Brcko permanent disability deduction."
              />
            </>
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <CurrencyAmountField
            id="ba-mortgage-interest"
            label="Mortgage Interest"
            value={inputs.contributions.mortgageInterest}
            onChange={(amount) => setContribution("mortgageInterest", amount)}
            currency={currency}
            step={100}
            description="Deductible mortgage interest entered as an annual amount."
          />
          {inputs.entity === "fbih" ? (
            <CurrencyAmountField
              id="ba-fbih-life-insurance"
              label="Life Insurance Premium"
              value={inputs.contributions.lifeInsurancePremium}
              onChange={(amount) =>
                setContribution("lifeInsurancePremium", amount)
              }
              currency={currency}
              step={100}
              description="FBiH life insurance premium deduction entered as an annual amount."
            />
          ) : null}
          {inputs.entity === "bd" ? (
            <CurrencyAmountField
              id="ba-bd-education"
              label="Children Education Costs"
              value={inputs.contributions.educationExpenses}
              onChange={(amount) => setContribution("educationExpenses", amount)}
              currency={currency}
              step={100}
              description="Brcko District children education costs paid to a school institution."
            />
          ) : null}
          {contributionLimits.map(([contributionKey, limit]) => (
            <ContributionSlider
              key={contributionKey}
              label={limit.name}
              value={contributionValues[contributionKey] ?? 0}
              onChange={(amount) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    [contributionKey]: Math.min(amount, limit.limit),
                  },
                }))
              }
              max={limit.limit}
              step={Math.max(1, Math.round(limit.limit / 100))}
              currency={currency}
              description={limit.description}
            />
          ))}
        </div>
      }
      contributionsTitle="Optional Entity Deductions"
      contributionsDescription="Mortgage interest, life insurance, education, and capped entity deductions for the selected jurisdiction"
      infoCard={
        <InfoPanel title="Bosnia Payroll Scope">
          <p>
            Bosnia and Herzegovina has separate salary-tax systems in the
            Federation of BiH, Republika Srpska, and Brcko District. Choose the
            jurisdiction that matches the local payroll, then the calculator
            applies the relevant flat tax rate, personal allowance, and
            employee contribution treatment.
          </p>
        </InfoPanel>
      }
      seoInfo={<BosniaTaxInfo />}
    />
  );
}

function BosniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Bosnia and Herzegovina Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Federation of BiH</strong> - 10%
            income tax after modeled employee contributions, personal
            allowance, spouse, child and parent allowances, mortgage interest,
            and FBiH life insurance deductions.
          </li>
          <li>
            <strong className="text-zinc-300">Republika Srpska</strong> - 8%
            income tax after personal and dependent allowances, mortgage
            interest, and capped voluntary retirement or life insurance
            deductions, with employee social contributions withheld separately
            from gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">Brcko District</strong> - 10%
            income tax with a personal allowance, dependent and disability
            deductions, life insurance, mortgage interest, children education
            costs, and a simplified employee contribution model.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus income tax, employee payroll
            contributions, and selected voluntary deductions.
          </li>
        </ul>
      </div>
    </section>
  );
}
