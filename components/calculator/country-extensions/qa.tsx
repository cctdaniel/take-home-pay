"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
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
import {
  QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
  QA_PENSION_MONTHLY_SALARY_CAP,
} from "@/lib/countries/qa/constants/tax-year-2026";
import type {
  QAContributionSalaryCapTreatment,
  QACalculatorInputs,
  QAEmployeeType,
} from "@/lib/countries/qa/types";
import { formatCurrency } from "@/lib/format";

const EMPLOYEE_TYPE_OPTIONS: SelectOption<QAEmployeeType>[] = [
  { value: "expatriate", label: "Expatriate employee" },
  { value: "qatariPensionCovered", label: "Qatari/GCC pension-covered" },
];

const CONTRIBUTION_CAP_OPTIONS: SelectOption<QAContributionSalaryCapTreatment>[] =
  [
    { value: "standardCap", label: "Standard QAR 100,000 cap" },
    { value: "grandfathered", label: "Grandfathered pre-law salary" },
  ];

function getContributionSalaryMax(
  annualGrossSalary: number,
  contributionSalaryCapTreatment: QAContributionSalaryCapTreatment,
) {
  const monthlyCashGross = Math.max(0, annualGrossSalary) / 12;

  return contributionSalaryCapTreatment === "grandfathered"
    ? monthlyCashGross
    : Math.min(monthlyCashGross, QA_PENSION_MONTHLY_SALARY_CAP);
}

function clampMonthlyAmount(value: number, max = Infinity) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), max);
}

export default function QatarCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<QACalculatorInputs>(country);
  const isPensionCovered = inputs.employeeType === "qatariPensionCovered";
  const contributionSalaryMax = getContributionSalaryMax(
    inputs.grossSalary,
    inputs.contributionSalaryCapTreatment,
  );
  const housingAllowanceMax = Math.min(
    QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
    contributionSalaryMax,
  );
  const hasComponentInputs =
    inputs.grsiaBasicSalaryMonthly > 0 ||
    inputs.grsiaSocialAllowanceMonthly > 0 ||
    inputs.grsiaHousingAllowanceMonthly > 0;
  const displayedBasicSalary = clampMonthlyAmount(
    hasComponentInputs
      ? inputs.grsiaBasicSalaryMonthly
      : inputs.grsiaContributionSalaryMonthly,
    contributionSalaryMax,
  );
  const displayedSocialAllowance = clampMonthlyAmount(
    inputs.grsiaSocialAllowanceMonthly,
    contributionSalaryMax,
  );
  const displayedHousingAllowance = clampMonthlyAmount(
    inputs.grsiaHousingAllowanceMonthly,
    housingAllowanceMax,
  );
  const selectedContributionSalaryMonthly =
    displayedBasicSalary +
    displayedSocialAllowance +
    displayedHousingAllowance;
  const cappedContributionSalaryMonthly = Math.min(
    selectedContributionSalaryMonthly,
    contributionSalaryMax,
  );
  const contributionCapDescription =
    selectedContributionSalaryMonthly > contributionSalaryMax
      ? `Current components total ${formatCurrency(
          selectedContributionSalaryMonthly,
          currency,
        )}; employee social insurance uses ${formatCurrency(
          cappedContributionSalaryMonthly,
          currency,
        )} after the monthly cap.`
      : `Current components total ${formatCurrency(
          selectedContributionSalaryMonthly,
          currency,
        )}.`;

  const setEmployeeType = (employeeType: QAEmployeeType) => {
    setInputs((current) => ({
      ...current,
      employeeType,
      grsiaBasicSalaryMonthly:
        employeeType === "qatariPensionCovered"
          ? current.grsiaBasicSalaryMonthly ||
            current.grsiaContributionSalaryMonthly ||
            getContributionSalaryMax(
              current.grossSalary,
              current.contributionSalaryCapTreatment,
            )
          : 0,
      grsiaSocialAllowanceMonthly:
        employeeType === "qatariPensionCovered"
          ? clampMonthlyAmount(
              current.grsiaSocialAllowanceMonthly,
              getContributionSalaryMax(
                current.grossSalary,
                current.contributionSalaryCapTreatment,
              ),
            )
          : 0,
      grsiaHousingAllowanceMonthly:
        employeeType === "qatariPensionCovered"
          ? clampMonthlyAmount(
              current.grsiaHousingAllowanceMonthly,
              Math.min(
                QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
                getContributionSalaryMax(
                  current.grossSalary,
                  current.contributionSalaryCapTreatment,
                ),
              ),
            )
          : 0,
      grsiaContributionSalaryMonthly: 0,
    }));
  };

  const setContributionCapTreatment = (
    contributionSalaryCapTreatment: QAContributionSalaryCapTreatment,
  ) => {
    setInputs((current) => {
      const max =
        contributionSalaryCapTreatment === "grandfathered"
          ? Math.max(0, current.grossSalary / 12)
          : Math.min(
              Math.max(0, current.grossSalary / 12),
              QA_PENSION_MONTHLY_SALARY_CAP,
            );

      return {
        ...current,
        contributionSalaryCapTreatment,
        grsiaBasicSalaryMonthly: clampMonthlyAmount(
          current.grsiaBasicSalaryMonthly ||
            current.grsiaContributionSalaryMonthly,
          max,
        ),
        grsiaSocialAllowanceMonthly: clampMonthlyAmount(
          current.grsiaSocialAllowanceMonthly,
          max,
        ),
        grsiaHousingAllowanceMonthly: clampMonthlyAmount(
          current.grsiaHousingAllowanceMonthly,
          Math.min(QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP, max),
        ),
        grsiaContributionSalaryMonthly: 0,
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
            id="qa-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="qa-employee-type"
            label="Employee Type"
            value={inputs.employeeType}
            onChange={setEmployeeType}
            options={EMPLOYEE_TYPE_OPTIONS}
            description="Select Qatari/GCC pension coverage only when the employee is registered under Qatar social insurance."
          />
          {isPensionCovered ? (
            <>
              <SelectField
                id="qa-contribution-cap-treatment"
                label="GRSIA Salary Cap Treatment"
                value={inputs.contributionSalaryCapTreatment}
                onChange={setContributionCapTreatment}
                options={CONTRIBUTION_CAP_OPTIONS}
                description="Use the grandfathered option only for an insured salary above QAR 100,000 that was fixed before the new-law cap applied."
              />
              <CurrencyAmountField
                id="qa-grsia-basic-salary"
                label="Monthly GRSIA Basic Salary"
                value={displayedBasicSalary}
                onChange={(grsiaBasicSalaryMonthly) =>
                  setInputs((current) => ({
                    ...current,
                    grsiaBasicSalaryMonthly: clampMonthlyAmount(
                      grsiaBasicSalaryMonthly,
                      getContributionSalaryMax(
                        current.grossSalary,
                        current.contributionSalaryCapTreatment,
                      ),
                    ),
                    grsiaContributionSalaryMonthly: 0,
                  }))
                }
                currency={currency}
                min={0}
                max={contributionSalaryMax}
                step={500}
                description="Basic salary included in the official GRSIA contribution salary."
              />
              <CurrencyAmountField
                id="qa-grsia-social-allowance"
                label="Monthly GRSIA Social Allowance"
                value={displayedSocialAllowance}
                onChange={(grsiaSocialAllowanceMonthly) =>
                  setInputs((current) => ({
                    ...current,
                    grsiaSocialAllowanceMonthly: clampMonthlyAmount(
                      grsiaSocialAllowanceMonthly,
                      getContributionSalaryMax(
                        current.grossSalary,
                        current.contributionSalaryCapTreatment,
                      ),
                    ),
                    grsiaContributionSalaryMonthly: 0,
                  }))
                }
                currency={currency}
                min={0}
                max={contributionSalaryMax}
                step={500}
                description="Social allowance included in contribution salary, if the employee has one."
              />
              <CurrencyAmountField
                id="qa-grsia-housing-allowance"
                label="Monthly GRSIA Housing Allowance"
                value={displayedHousingAllowance}
                onChange={(grsiaHousingAllowanceMonthly) =>
                  setInputs((current) => ({
                    ...current,
                    grsiaHousingAllowanceMonthly: clampMonthlyAmount(
                      grsiaHousingAllowanceMonthly,
                      Math.min(
                        QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
                        getContributionSalaryMax(
                          current.grossSalary,
                          current.contributionSalaryCapTreatment,
                        ),
                      ),
                    ),
                    grsiaContributionSalaryMonthly: 0,
                  }))
                }
                currency={currency}
                min={0}
                max={housingAllowanceMax}
                step={500}
                description={`Housing allowance included in GRSIA salary is capped at QAR ${QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP.toLocaleString()} per month. ${contributionCapDescription}`}
              />
            </>
          ) : null}
        </CalculatorFieldGrid>
      }
      contributionsTitle="Qatar Payroll Coverage Notes"
      contributionsDescription="Personal income tax is 0%; Qatari/GCC social insurance is selected above when applicable"
      contributionsEmptyState="Qatar salary income is modeled with no personal income tax. Expatriate employees normally have no employee-side statutory deduction, and Qatari/GCC social insurance is selected above as payroll coverage rather than an annual employee deduction."
      infoCard={
        <InfoPanel title="Qatar Payroll Scope">
          <p>
            Qatar does not impose personal income tax on salaries, wages, or
            allowances from employment. Expatriate employees normally have no
            Qatar employee-side statutory social insurance deduction; covered
            Qatari/GCC employees can model the 7% employee social insurance
            contribution on monthly GRSIA basic salary, social allowance, and
            housing allowance components.
          </p>
        </InfoPanel>
      }
      seoInfo={<QatarTaxInfo />}
    />
  );
}

function QatarTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Qatar Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - salary,
            wages, and allowances from employment are not subject to Qatar
            personal income tax.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Contributions</strong> -
            expatriate employees are modeled with no Qatar employee-side
            statutory contribution. Qatari/GCC pension-covered employees deduct
            7% social insurance on GRSIA basic salary, social allowance, and
            housing allowance. The housing allowance component is capped at QAR
            6,000 per month, and standard total contribution salary is capped at
            QAR 100,000 per month unless the pre-law grandfathered option
            applies.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus any selected employee social insurance
            contribution.
          </li>
        </ul>
      </div>
    </section>
  );
}
