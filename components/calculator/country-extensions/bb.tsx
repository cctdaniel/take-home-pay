"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
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
  BB_MEDICAL_EXAM_LIMIT,
  BB_NIS_EMPLOYEE_RATE,
  BB_NIS_MONTHLY_CAP_2026,
  BB_PENSIONER_ALLOWANCE,
  BB_PERSONAL_ALLOWANCE,
  BB_REGISTERED_CHARITY_RATE_LIMIT,
  BB_RENEWABLE_ENERGY_DEDUCTION_LIMIT,
  BB_RESILIENCE_FUND_RATE,
  BB_SPOUSE_ALLOWANCE,
  BB_UNION_SUBSCRIPTION_LIMIT,
} from "@/lib/countries/bb/constants/tax-year-2026";
import type {
  BBAgeAllowanceStatus,
  BBCalculatorInputs,
  BBCharityType,
  BBContributionInputs,
  BBResidencyStatus,
} from "@/lib/countries/bb/types";

const RESIDENCY_OPTIONS: Array<{
  value: BBResidencyStatus;
  label: string;
}> = [
  { value: "resident", label: "Resident" },
  { value: "nonResident", label: "Non-resident Barbados-source salary" },
];

const AGE_ALLOWANCE_OPTIONS: Array<{
  value: BBAgeAllowanceStatus;
  label: string;
}> = [
  { value: "standard", label: "Standard resident" },
  { value: "age40Plus", label: "Age 40+ medical deduction eligible" },
  { value: "pensioner60Plus", label: "Age 60+ receiving pension" },
];

const CHARITY_TYPE_OPTIONS: Array<{
  value: BBCharityType;
  label: string;
}> = [
  { value: "registeredNonExempt", label: "Registered non-exempt charity" },
  { value: "exemptCharity", label: "Exempt charity" },
];

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

const ZERO_CONTRIBUTIONS: BBContributionInputs = {
  retirementContribution: 0,
  qualifyingExpenses: 0,
  charitableDonations: 0,
  medicalExpenses: 0,
  housingExpenses: 0,
};

export default function BBCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<BBCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof BBContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;
  const isResident = inputs.residencyStatus === "resident";

  const setContribution = (
    key: keyof BBContributionInputs,
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

  const renderContributionSlider = (
    key: keyof BBContributionInputs,
    step: number,
  ) => {
    const limit = getLimit(key);

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
        step={step}
        currency={currency}
        description={contributionLimits[key]?.description}
      />
    );
  };

  const annualReturnInputs = [
    renderContributionSlider("medicalExpenses", 25),
    renderContributionSlider("qualifyingExpenses", 10),
    renderContributionSlider(
      "charitableDonations",
      Math.max(50, Math.round(getLimit("charitableDonations") / 100)),
    ),
    renderContributionSlider("housingExpenses", 100),
  ].filter(Boolean);

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
            id="bb-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="bb-residency-status"
            label="Tax Residency"
            value={inputs.residencyStatus}
            onChange={(residencyStatus) =>
              setInputs((current) => ({
                ...current,
                residencyStatus,
                ageAllowanceStatus:
                  residencyStatus === "resident"
                    ? current.ageAllowanceStatus
                    : "standard",
                hasEligibleSpouse:
                  residencyStatus === "resident"
                    ? current.hasEligibleSpouse
                    : false,
                charityType:
                  residencyStatus === "resident"
                    ? current.charityType
                    : "registeredNonExempt",
                contributions:
                  residencyStatus === "resident"
                    ? current.contributions
                    : { ...current.contributions, ...ZERO_CONTRIBUTIONS },
              }))
            }
            options={RESIDENCY_OPTIONS}
            description="Non-residents are modeled without Barbados personal allowances or resident deductions."
          />
          {isResident ? (
            <>
              <SelectField
                id="bb-age-allowance-status"
                label="Allowance Status"
                value={inputs.ageAllowanceStatus}
                onChange={(ageAllowanceStatus) =>
                  setInputs((current) => ({
                    ...current,
                    ageAllowanceStatus,
                    contributions:
                      ageAllowanceStatus === "standard"
                        ? {
                            ...current.contributions,
                            medicalExpenses: 0,
                          }
                        : current.contributions,
                  }))
                }
                options={AGE_ALLOWANCE_OPTIONS}
                description="Age 60+ pensioner mode uses the BBD 40,000 allowance; age 40+ enables medical-exam relief."
              />
              <BooleanSelectField
                id="bb-spouse-allowance"
                label="Eligible Spouse Allowance"
                value={inputs.hasEligibleSpouse}
                onChange={(hasEligibleSpouse) =>
                  setInputs((current) => ({ ...current, hasEligibleSpouse }))
                }
                trueLabel="Claim BBD 3,000"
                falseLabel="No spouse allowance"
                description="For a spouse with no income, or investment income not over BBD 800, and no reverse tax credit claim."
              />
              <SelectField
                id="bb-charity-type"
                label="Charity Type"
                value={inputs.charityType}
                onChange={(charityType) =>
                  setInputs((current) => {
                    const nextInputs = { ...current, charityType };
                    const limit =
                      getCountryCalculator(country).getContributionLimits(
                        nextInputs,
                      ).charitableDonations?.limit ?? 0;

                    return {
                      ...nextInputs,
                      contributions: {
                        ...current.contributions,
                        charitableDonations: clampAmount(
                          current.contributions.charitableDonations ?? 0,
                          limit,
                        ),
                      },
                    };
                  })
                }
                options={CHARITY_TYPE_OPTIONS}
                description="Non-exempt registered charity donations are capped here at 10% of salary."
              />
            </>
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        annualReturnInputs.length > 0 ? (
          <div className="space-y-6">{annualReturnInputs}</div>
        ) : undefined
      }
      contributionsTitle="Resident Deductions"
      contributionsDescription="Modeled Barbados annual-return deductions that reduce income tax but are not payroll salary deductions"
      seoInfo={<BarbadosTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Barbados employment salary for income year 2026,
            including the reduced PIT rates, the selected personal allowance
            status, employee National Insurance, and the Resilience and
            Regeneration Fund contribution.
          </p>
          <p className="mt-2">
            Resident return inputs cover the spouse allowance, medical
            examination deduction, trade union or statutory association dues,
            charitable donations, and energy conservation or renewable energy
            deductions.
          </p>
        </InfoPanel>
      }
    />
  );
}

function BarbadosTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Barbados Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the 2026
            BRA rates after the BBD {BB_PERSONAL_ALLOWANCE.toLocaleString()}{" "}
            personal allowance, or BBD{" "}
            {BB_PENSIONER_ALLOWANCE.toLocaleString()} for age 60+ pensioners.
          </li>
          <li>
            <strong className="text-zinc-300">Spouse Allowance</strong> adds BBD{" "}
            {BB_SPOUSE_ALLOWANCE.toLocaleString()} when the selected resident
            eligibility conditions are met.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Payroll Deductions</strong>{" "}
            include National Insurance at {(BB_NIS_EMPLOYEE_RATE * 100).toFixed(1)}
            % up to BBD {BB_NIS_MONTHLY_CAP_2026.toLocaleString()} monthly
            earnings, plus the {(BB_RESILIENCE_FUND_RATE * 100).toFixed(2)}%
            Resilience and Regeneration Fund contribution.
          </li>
          <li>
            <strong className="text-zinc-300">Resident Deductions</strong> model
            annual medical exams up to BBD{" "}
            {BB_MEDICAL_EXAM_LIMIT.toLocaleString()}, union or statutory dues up
            to BBD {BB_UNION_SUBSCRIPTION_LIMIT.toLocaleString()}, charity
            claims including the{" "}
            {(BB_REGISTERED_CHARITY_RATE_LIMIT * 100).toFixed(0)}% registered
            non-exempt charity cap, and energy deductions up to BBD{" "}
            {BB_RENEWABLE_ENERGY_DEDUCTION_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
