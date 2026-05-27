"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
  MA_FAMILY_CHARGE_DEPENDENT_CAP,
  MA_FAMILY_CHARGE_TAX_REDUCTION,
  MA_CNSS_MONTHLY_CAP,
  MA_MORTGAGE_INTEREST_LIMIT_RATE,
} from "@/lib/countries/ma/constants/tax-year-2026";
import type { MACalculatorInputs } from "@/lib/countries/ma/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function MACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<MACalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const monthlyCashSalary = Math.max(0, inputs.grossSalary) / 12;
  const monthlyContributionWageMax = monthlyCashSalary;

  const setContribution = (
    key: "retirementContribution" | "housingExpenses" | "charitableDonations",
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
            id="ma-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="ma-cnss-amo-monthly-wage"
            label="Monthly CNSS/AMO Wage Base"
            value={Math.min(
              inputs.cnssAmoMonthlyWage || monthlyContributionWageMax,
              monthlyContributionWageMax,
            )}
            onChange={(cnssAmoMonthlyWage) =>
              setInputs((current) => ({
                ...current,
                cnssAmoMonthlyWage: clampAmount(
                  cnssAmoMonthlyWage,
                  monthlyContributionWageMax,
                ),
              }))
            }
            currency={currency}
            min={0}
            max={monthlyContributionWageMax}
            step={100}
            description={`Leave at 0 to use monthly gross salary. CNSS social allocation is capped at MAD ${MA_CNSS_MONTHLY_CAP.toLocaleString()} per month; AMO uses the selected wage without a cap.`}
          />
          <NumberStepperField
            id="ma-dependents"
            label="Family Dependents"
            value={inputs.numberOfDependents}
            onChange={(numberOfDependents) =>
              setInputs((current) => ({ ...current, numberOfDependents }))
            }
            min={0}
            max={MA_FAMILY_CHARGE_DEPENDENT_CAP}
            description={`MAD ${MA_FAMILY_CHARGE_TAX_REDUCTION.toLocaleString()} tax reduction per dependent, capped at ${MA_FAMILY_CHARGE_DEPENDENT_CAP}.`}
          />
          <BooleanSelectField
            id="ma-first-employment-exemption"
            label="First-Employment IR Exemption"
            value={inputs.firstEmploymentExemption}
            onChange={(firstEmploymentExemption) =>
              setInputs((current) => ({
                ...current,
                firstEmploymentExemption,
              }))
            }
            trueLabel="Eligible"
            falseLabel="Not eligible"
            description="For eligible first Moroccan CDI salary during the 36-month exemption window; CNSS and AMO still apply."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {(
            [
              "retirementContribution",
              "housingExpenses",
              "charitableDonations",
            ] as const
          ).map((key) => {
            const limit = contributionLimits[key];

            if (!limit || limit.limit <= 0) {
              return null;
            }

            return (
              <ContributionSlider
                key={key}
                label={limit.name}
                value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                onChange={(amount) => setContribution(key, amount)}
                max={limit.limit}
                step={key === "retirementContribution" ? 1000 : 500}
                currency={currency}
                description={limit.description}
              />
            );
          })}
        </div>
      }
      contributionsTitle="Morocco Deduction Inputs"
      contributionsDescription="Pension insurance, main-home mortgage interest, and recognized charitable contribution deductions"
      seoInfo={<MoroccoTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Morocco resident employment salary with the 2026 annual
            income-tax bands, CNSS, AMO, professional expense deduction, family
            charge tax reductions, pension insurance, main-home mortgage
            interest, and recognized charitable contributions.
          </p>
          <p className="mt-2">
            CIMR employer-plan mechanics, exempt allowance classifications,
            treaty-based social security exemptions, donation eligibility
            documentation, and non-salary income categories are not treated as
            employee salary inputs here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function MoroccoTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Morocco Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Professional expenses</strong>{" "}
            use the 35% low-salary rate up to MAD 78,000 and 25% above that,
            capped at MAD 35,000.
          </li>
          <li>
            <strong className="text-zinc-300">CNSS and AMO</strong> include the
            selected monthly contribution wage, the CNSS monthly cap, and the
            uncapped AMO employee contribution.
          </li>
          <li>
            <strong className="text-zinc-300">Family charges</strong> reduce
            tax by MAD {MA_FAMILY_CHARGE_TAX_REDUCTION.toLocaleString()} per
            selected dependent, capped at {MA_FAMILY_CHARGE_DEPENDENT_CAP}.
          </li>
          <li>
            <strong className="text-zinc-300">First employment</strong> can be
            toggled for eligible first Moroccan CDI salary during the 36-month
            IR exemption period.
          </li>
          <li>
            <strong className="text-zinc-300">Mortgage interest</strong> is
            modeled for a main home up to{" "}
            {(MA_MORTGAGE_INTEREST_LIMIT_RATE * 100).toFixed(0)}% of the
            salary-only taxable base before mortgage and charity deductions.
          </li>
          <li>
            <strong className="text-zinc-300">Pension insurance</strong> is
            deductible up to 50% of salary-only net taxable income before the
            pension deduction.
          </li>
        </ul>
      </div>
    </section>
  );
}
