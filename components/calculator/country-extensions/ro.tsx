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
  RO_EUR_400_RELIEF_CAP_RON,
  RO_EUR_100_RELIEF_CAP_RON,
  RO_HEALTH_INSURANCE_RATE,
  RO_INCOME_TAX_RATE,
  RO_MINIMUM_WAGE_PERIODS_2026,
  RO_PERSONAL_DEDUCTION_PHASEOUT_RANGE_RON,
  RO_SCHOOL_CHILD_DEDUCTION_MONTHLY,
  RO_SOCIAL_INSURANCE_RATE,
  RO_YOUNG_EMPLOYEE_SUPPLEMENT_RATE,
} from "@/lib/countries/ro/constants/tax-year-2026";
import type {
  ROCalculatorInputs,
  ROContributionInputs,
} from "@/lib/countries/ro/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function ROCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ROCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof ROContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof ROContributionInputs,
    amount: number,
  ) => {
    const limit = getLimit(key);

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
      },
    }));
  };
  const setPersonalDeductionInput = (
    updates: Partial<
      Pick<
        ROCalculatorInputs,
        | "claimPersonalDeduction"
        | "dependentCount"
        | "ageUnder26"
        | "schoolChildren"
      >
    >,
  ) => {
    setInputs((current) => ({
      ...current,
      ...updates,
      dependentCount:
        updates.dependentCount === undefined
          ? current.dependentCount
          : Math.min(Math.max(Math.trunc(updates.dependentCount), 0), 4),
      schoolChildren:
        updates.schoolChildren === undefined
          ? current.schoolChildren
          : Math.min(Math.max(Math.trunc(updates.schoolChildren), 0), 20),
    }));
  };

  const cappedDeductionInputs = ([
    "retirementContribution",
    "insurancePremiums",
    "sportsSubscriptions",
    "investmentSubscriptions",
  ] as const)
    .map((key) => {
      const limit = getLimit(key);

      if (limit <= 0) {
        return null;
      }

      return (
        <ContributionSlider
          key={key}
          label={contributionLimits[key].name}
          value={Math.min(inputs.contributions[key] ?? 0, limit)}
          onChange={(amount) => setContribution(key, amount)}
          max={limit}
          step={50}
          currency={currency}
          description={contributionLimits[key].description}
        />
      );
    })
    .filter(Boolean);

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
            id="ro-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="ro-claim-personal-deduction"
            label="Claim Personal Deduction"
            value={inputs.claimPersonalDeduction}
            onChange={(claimPersonalDeduction) =>
              setPersonalDeductionInput({ claimPersonalDeduction })
            }
            trueLabel="Primary job / claim"
            falseLabel="Do not claim"
            trueFirst
            description="Article 77 personal deductions are available only at the main employment place."
          />
          <NumberStepperField
            id="ro-dependent-count"
            label="Dependents For Basic Deduction"
            value={inputs.dependentCount}
            onChange={(dependentCount) =>
              setPersonalDeductionInput({ dependentCount })
            }
            min={0}
            max={4}
            description="Spouse, children, or qualifying family members; use 4 for four or more dependents."
          />
          <BooleanSelectField
            id="ro-age-under-26"
            label="Under Age 26"
            value={inputs.ageUnder26}
            onChange={(ageUnder26) => setPersonalDeductionInput({ ageUnder26 })}
            trueLabel="Apply 15% supplement"
            falseLabel="No under-26 supplement"
            description="Applies when monthly gross salary is within the personal-deduction income band."
          />
          <NumberStepperField
            id="ro-school-children"
            label="Children Under 18 In School"
            value={inputs.schoolChildren}
            onChange={(schoolChildren) =>
              setPersonalDeductionInput({ schoolChildren })
            }
            min={0}
            max={10}
            description="RON 100/month per child can be claimed by one parent when the child is enrolled in school."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        cappedDeductionInputs.length > 0 ? (
          <div className="space-y-6">
            {cappedDeductionInputs}
            <CurrencyAmountField
              id="ro-union-fees"
              label={contributionLimits.unionFees.name}
              value={inputs.contributions.unionFees ?? 0}
              onChange={(amount) => setContribution("unionFees", amount)}
              currency={currency}
              step={50}
              description={contributionLimits.unionFees.description}
            />
          </div>
        ) : undefined
      }
      contributionsTitle="Romania Employee Deductions"
      contributionsDescription="Employee-paid pension, health, union, sports, and qualifying investment deductions"
      seoInfo={<RomaniaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Romania salary income with flat PIT, employee CAS and
            CASS, plus the employee-paid voluntary pension and voluntary
            health/private healthcare deductions, trade union fees, sports
            subscriptions, qualifying investment subscriptions, Article 77
            personal deductions, under-26 supplement, and school-child deduction.
          </p>
          <p className="mt-2">
            The personal deduction uses the 2026 minimum wage periods of RON{" "}
            {RO_MINIMUM_WAGE_PERIODS_2026[0].monthlyMinimumWage.toLocaleString()}{" "}
            through June and RON{" "}
            {RO_MINIMUM_WAGE_PERIODS_2026[1].monthlyMinimumWage.toLocaleString()}{" "}
            from July. Special sector regimes, meal tickets, and live EUR/RON
            relief conversion remain separate from this annual salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function RomaniaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Romania Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> is modeled at{" "}
            {(RO_INCOME_TAX_RATE * 100).toFixed(0)}% after mandatory employee
            social contributions and modeled deductions.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Contributions</strong>{" "}
            include CAS at {(RO_SOCIAL_INSURANCE_RATE * 100).toFixed(0)}% and
            CASS at {(RO_HEALTH_INSURANCE_RATE * 100).toFixed(0)}%.
          </li>
          <li>
            <strong className="text-zinc-300">Personal Deduction</strong> uses
            the Article 77 dependent-count percentages and RON{" "}
            {RO_PERSONAL_DEDUCTION_PHASEOUT_RANGE_RON.toLocaleString()} monthly
            phase-out band above the applicable minimum wage.
          </li>
          <li>
            <strong className="text-zinc-300">Supplemental Deductions</strong>{" "}
            include the under-26 deduction at{" "}
            {(RO_YOUNG_EMPLOYEE_SUPPLEMENT_RATE * 100).toFixed(0)}% of the
            applicable minimum wage and the RON{" "}
            {RO_SCHOOL_CHILD_DEDUCTION_MONTHLY.toLocaleString()} per-month
            school-child deduction when selected.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary Pension And Health</strong>{" "}
            deductions are each modeled up to RON{" "}
            {RO_EUR_400_RELIEF_CAP_RON.toLocaleString()}, the configured EUR
            400-equivalent cap.
          </li>
          <li>
            <strong className="text-zinc-300">Union, Sports, And Investments</strong>{" "}
            include employee-paid union fees, sports facility subscriptions up
            to RON {RO_EUR_100_RELIEF_CAP_RON.toLocaleString()}, and qualifying
            ETF/share/bond subscriptions up to RON{" "}
            {RO_EUR_400_RELIEF_CAP_RON.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
