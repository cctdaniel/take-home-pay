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
  LK_APPROVED_CHARITY_DONATION_LIMIT,
  LK_EPF_EMPLOYER_RATE,
  LK_ETF_EMPLOYER_RATE,
  LK_SOLAR_PANEL_RELIEF_LIMIT,
  LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_RATE,
  LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_THRESHOLD,
  LK_TABLE_03_OTHER_TERMINAL_BENEFIT_RATE,
} from "@/lib/countries/lk/constants/tax-year-2026";
import type {
  LKCalculatorInputs,
  LKContributionInputs,
  LKEmploymentType,
  LKTerminalBenefitTreatment,
} from "@/lib/countries/lk/types";
import { clampAmount } from "@/lib/utils";

const EMPLOYMENT_TYPE_OPTIONS: Array<{
  value: LKEmploymentType;
  label: string;
}> = [
  { value: "primary", label: "Resident primary employment" },
  { value: "secondary", label: "Resident secondary employment" },
  { value: "foreignEmployer", label: "Remote foreign employer" },
  { value: "nonResidentNonCitizen", label: "Non-resident non-citizen" },
];

const TERMINAL_BENEFIT_TREATMENT_OPTIONS: Array<{
  value: LKTerminalBenefitTreatment;
  label: string;
}> = [
  { value: "approvedOrEtf", label: "Approved scheme / ETF Table 03" },
  { value: "otherOrUnapproved", label: "Other or unapproved Table 03" },
];

export default function LKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<LKCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof LKContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof LKContributionInputs,
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
    key: keyof LKContributionInputs,
    fallbackLabel: string,
    fallbackDescription: string,
    step: number,
  ) => {
    const limit = getLimit(key);

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key]?.name ?? fallbackLabel}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={step}
        currency={currency}
        description={
          contributionLimits[key]?.description ?? fallbackDescription
        }
      />
    );
  };

  const annualReturnInputs = [
    renderContributionSlider(
      "housingExpenses",
      "Solar panel relief",
      "Resident solar-panel relief capped at LKR 600,000 per year.",
      10000,
    ),
    renderContributionSlider(
      "charitableDonations",
      "Approved charity donations",
      "Approved charitable-institution donations capped at the lower of one-third of taxable income or LKR 75,000.",
      1000,
    ),
    renderContributionSlider(
      "qualifyingExpenses",
      "Government or specified institution donations",
      "Qualifying payments capped here to the remaining modeled taxable salary base.",
      Math.max(1000, Math.round(getLimit("qualifyingExpenses") / 100)),
    ),
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
            id="lk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="lk-employment-type"
            label="APIT Employment Table"
            value={inputs.employmentType}
            onChange={(employmentType) =>
              setInputs((current) => ({
                ...current,
                employmentType,
                epfCovered:
                  employmentType === "foreignEmployer"
                    ? false
                    : current.epfCovered,
                contributions:
                  employmentType === "nonResidentNonCitizen" ||
                  employmentType === "secondary"
                    ? {
                        ...current.contributions,
                        housingExpenses: 0,
                        charitableDonations:
                          employmentType === "secondary"
                            ? 0
                            : current.contributions.charitableDonations,
                        qualifyingExpenses:
                          employmentType === "secondary"
                            ? 0
                            : current.contributions.qualifyingExpenses,
                      }
                    : current.contributions,
              }))
            }
            options={EMPLOYMENT_TYPE_OPTIONS}
            description="Choose the IRD APIT table for this employment income. Table 08 does not cover freelancers."
          />
          {inputs.employmentType === "secondary" ? (
            <CurrencyAmountField
              id="lk-primary-monthly-remuneration"
              label="Primary monthly remuneration"
              value={inputs.primaryMonthlyRemuneration}
              onChange={(primaryMonthlyRemuneration) =>
                setInputs((current) => ({
                  ...current,
                  primaryMonthlyRemuneration: Math.max(
                    0,
                    primaryMonthlyRemuneration,
                  ),
                }))
              }
              currency={currency}
              step={1000}
              description="Used only for resident secondary employment to choose the IRD Table 07 rate."
            />
          ) : null}
          {inputs.employmentType !== "foreignEmployer" ? (
            <BooleanSelectField
              id="lk-epf-covered"
              label="EPF / ETF Coverage"
              value={inputs.epfCovered}
              onChange={(epfCovered) =>
                setInputs((current) => ({ ...current, epfCovered }))
              }
              trueLabel="Covered"
              falseLabel="Not covered"
              trueFirst
              description={`Covered employment deducts employee EPF at 8%; results also show employer EPF at ${(LK_EPF_EMPLOYER_RATE * 100).toFixed(0)}% and ETF at ${(LK_ETF_EMPLOYER_RATE * 100).toFixed(0)}% as context only.`}
            />
          ) : null}
          <CurrencyAmountField
            id="lk-lump-sum-payments"
            label="Annual bonus or lump-sum payments"
            value={inputs.annualLumpSumPayments}
            onChange={(annualLumpSumPayments) =>
              setInputs((current) => ({
                ...current,
                annualLumpSumPayments: Math.max(0, annualLumpSumPayments),
              }))
            }
            currency={currency}
            step={10000}
            description="Bonus, leave encashment, medical reimbursement, salary arrears, or employee-share amounts taxed through IRD lump-sum rules."
          />
          <CurrencyAmountField
            id="lk-taxable-non-cash-benefits"
            label="Taxable in-kind / non-cash benefits"
            value={inputs.taxableNonCashBenefits}
            onChange={(taxableNonCashBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonCashBenefits: Math.max(0, taxableNonCashBenefits),
              }))
            }
            currency={currency}
            step={10000}
            description="Taxable employment benefit value from the IRD non-cash-benefit circular; this is the salary-model input for in-kind benefits and increases APIT but not cash take-home."
          />
          <CurrencyAmountField
            id="lk-terminal-benefits"
            label="Taxable terminal benefits"
            value={inputs.taxableTerminalBenefits}
            onChange={(taxableTerminalBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableTerminalBenefits: Math.max(
                  0,
                  taxableTerminalBenefits,
                ),
              }))
            }
            currency={currency}
            step={100000}
            description="Once-and-for-all taxable retirement, gratuity, ETF, compensation, or termination payments under IRD APIT Table 03. Leave exempt provident-fund, government-pension, injury, or death-compensation amounts out."
          />
          {inputs.taxableTerminalBenefits > 0 ? (
            <SelectField
              id="lk-terminal-benefit-treatment"
              label="Terminal benefit APIT treatment"
              value={inputs.terminalBenefitTreatment}
              onChange={(terminalBenefitTreatment) =>
                setInputs((current) => ({
                  ...current,
                  terminalBenefitTreatment,
                }))
              }
              options={TERMINAL_BENEFIT_TREATMENT_OPTIONS}
              description="Approved scheme and ETF-style amounts withhold under Table 03 paragraph 2; other or unapproved amounts use paragraph 3."
            />
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        annualReturnInputs.length > 0 ? (
          <div className="space-y-6">{annualReturnInputs}</div>
        ) : undefined
      }
      contributionsTitle="Annual Return Reliefs"
      contributionsDescription="Modeled Sri Lanka reliefs and qualifying payments that reduce annual income tax but are not salary payroll deductions"
      seoInfo={<SriLankaTaxInfo />}
      infoCard={
        <InfoPanel title="Employee Salary Inputs">
          <p>
            This models Sri Lanka employment salary for the 2025/2026 year of
            assessment, including the selected IRD APIT employment table and
            the employee EPF deduction when covered.
          </p>
          <p className="mt-2">
            The secondary-employment option uses IRD Table 07 and depends on
            the primary monthly remuneration you enter. The foreign-employer
            option follows IRD Table 08 for resident remote employees paid in
            foreign currency through a bank.
          </p>
          <p className="mt-2">
            Bonus and other lump-sum cash employment payments are shown as a
            separate input because IRD Table 02 taxes them through the annual
            cumulative employment-income calculation. Taxable in-kind or
            non-cash benefits are shown as their own input too; they increase
            APIT but are not cash paid to you.
          </p>
          <p className="mt-2">
            Taxable terminal benefits are separate retirement or termination
            payments under IRD Table 03, so they have their own input and
            treatment selector. Employer EPF and ETF are shown in the results
            as employer-cost context; they are not deducted from employee
            salary.
          </p>
          <p className="mt-2">
            The Sri Lanka controls above cover the verified employee-facing
            salary levers from the IRD APIT material: employment table, EPF
            coverage, lump sums, taxable non-cash benefits, terminal benefits,
            solar relief, approved charity donations, and Government or
            specified-institution qualifying payments. Rent relief belongs to
            rental income from investment assets. Business income and
            independent-contractor withholding are separate income categories,
            while double-tax-agreement claims need residency, source-country
            withholding, and certificate facts instead of a payroll slider.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SriLankaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Sri Lanka Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Primary Employment</strong> uses
            the 2025/2026 personal relief of LKR 1,800,000 and the IRD
            progressive APIT bands.
          </li>
          <li>
            <strong className="text-zinc-300">Secondary Employment</strong>{" "}
            uses IRD Table 07, with the withholding rate based on your primary
            monthly remuneration and this secondary job&apos;s monthly remuneration.
          </li>
          <li>
            <strong className="text-zinc-300">Remote Foreign Employer</strong>{" "}
            uses the IRD Table 08 bands for resident employees whose foreign
            employer is outside Sri Lanka and pays through bank-remitted foreign
            currency.
          </li>
          <li>
            <strong className="text-zinc-300">Lump Sums and Benefits</strong>{" "}
            include annual cash bonus-style payments in take-home pay, while
            taxable in-kind or non-cash benefit values increase APIT only.
          </li>
          <li>
            <strong className="text-zinc-300">Terminal Benefits</strong> use
            IRD Table 03 when entered separately: approved scheme or ETF-style
            taxable payments apply{" "}
            {(LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_RATE * 100).toFixed(0)}%
            above LKR{" "}
            {LK_TABLE_03_APPROVED_TERMINAL_BENEFIT_THRESHOLD.toLocaleString()},
            while other or unapproved taxable payments use{" "}
            {(LK_TABLE_03_OTHER_TERMINAL_BENEFIT_RATE * 100).toFixed(0)}%
            unless the total remains within the personal relief threshold.
          </li>
          <li>
            <strong className="text-zinc-300">EPF</strong> is modeled as an 8%
            employee payroll deduction on regular cash remuneration when
            covered; employer EPF and ETF do not reduce employee take-home pay.
          </li>
          <li>
            <strong className="text-zinc-300">Annual Reliefs</strong> include
            the LKR {LK_SOLAR_PANEL_RELIEF_LIMIT.toLocaleString()} solar-panel
            relief, approved charity donations up to LKR{" "}
            {LK_APPROVED_CHARITY_DONATION_LIMIT.toLocaleString()}, and modeled
            Government or specified institution qualifying payments.
          </li>
        </ul>
      </div>
    </section>
  );
}
