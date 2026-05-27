"use client";

import {
  CalculatorFieldGrid,
  NumberField,
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
  IL_CREDIT_POINT_MONTHLY_VALUE,
  IL_CREDIT_POINT_VALUE,
  IL_EMPLOYEE_PENSION_RATE,
  IL_NII_MONTHLY_CEILING,
  IL_NII_REDUCED_MONTHLY_LIMIT,
  IL_RESIDENT_CREDIT_POINTS,
  IL_SECTION_46_DONATION_ABSOLUTE_LIMIT,
  IL_SECTION_46_DONATION_CREDIT_RATE,
  IL_SECTION_46_DONATION_LIMIT_RATE,
  IL_SECTION_46_DONATION_MINIMUM,
  IL_STUDY_FUND_EMPLOYEE_RATE,
  IL_STUDY_FUND_EMPLOYER_RATE,
  IL_STUDY_FUND_MONTHLY_SALARY_CAP,
} from "@/lib/countries/il/constants/tax-year-2026";
import type {
  ILCalculatorInputs,
  ILContributionInputs,
} from "@/lib/countries/il/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function ILCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ILCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const studyFundLimit = contributionLimits.qualifyingExpenses?.limit ?? 0;
  const donationLimit = contributionLimits.charitableDonations?.limit ?? 0;

  const setContribution = (
    key: keyof ILContributionInputs,
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
            id="il-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberField
            id="il-additional-credit-points"
            label="Additional Credit Points"
            value={inputs.additionalCreditPoints}
            onChange={(additionalCreditPoints) =>
              setInputs((current) => ({ ...current, additionalCreditPoints }))
            }
            min={0}
            max={20}
            step={0.25}
            description="Enter extra points beyond the modeled 2.25 resident points for gender, children, immigration, disability, military, or other eligibility."
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Israel Study Fund and Credit-Point Inputs"
      contributionsDescription="Israel study fund contributions, Section 46 donation credits, and credit-point eligibility"
      contributions={
        studyFundLimit > 0 || donationLimit > 0 ? (
          <div className="space-y-6">
            {studyFundLimit > 0 ? (
              <ContributionSlider
                label={
                  contributionLimits.qualifyingExpenses?.name ??
                  "Study fund employee contribution"
                }
                value={Math.min(
                  inputs.contributions.qualifyingExpenses ?? 0,
                  studyFundLimit,
                )}
                onChange={(amount) =>
                  setContribution("qualifyingExpenses", amount)
                }
                max={studyFundLimit}
                step={50}
                currency={currency}
                description={contributionLimits.qualifyingExpenses?.description}
              />
            ) : null}
            {donationLimit > 0 ? (
              <ContributionSlider
                label={
                  contributionLimits.charitableDonations?.name ??
                  "Section 46 approved donations"
                }
                value={Math.min(
                  inputs.contributions.charitableDonations ?? 0,
                  donationLimit,
                )}
                onChange={(amount) =>
                  setContribution("charitableDonations", amount)
                }
                max={donationLimit}
                step={100}
                currency={currency}
                description={contributionLimits.charitableDonations?.description}
              />
            ) : null}
          </div>
        ) : undefined
      }
      seoInfo={<IsraelTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Israel resident employment salary with 2026 annualized
            monthly tax brackets, basic resident credit points, any additional
            credit points entered, National Insurance and health insurance, and
            employee pension contribution with its tax credit. Optional study
            fund contributions are modeled as a cash deduction with employer
            matching shown as account value. Section 46 approved donations are
            modeled as a non-refundable tax credit when the annual donation
            threshold is met.
          </p>
          <p className="mt-2">
            Severance, employer pension contributions, study-fund withdrawal
            tax/vesting rules, Section 46 institution/document reporting
            checks, and irregular bonus payroll timing are not included in this
            salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function IsraelTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Israel Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Credit Points</strong> include{" "}
            {IL_RESIDENT_CREDIT_POINTS} resident points plus the additional
            points entered, with each point worth ILS{" "}
            {IL_CREDIT_POINT_MONTHLY_VALUE.toLocaleString()} per month or ILS{" "}
            {IL_CREDIT_POINT_VALUE.toLocaleString()} per year.
          </li>
          <li>
            <strong className="text-zinc-300">National Insurance</strong> uses
            reduced and full employee rates up to the annualized ILS{" "}
            {IL_NII_MONTHLY_CEILING.toLocaleString()} monthly ceiling, with the
            reduced band ending at ILS{" "}
            {IL_NII_REDUCED_MONTHLY_LIMIT.toLocaleString()} per month.
          </li>
          <li>
            <strong className="text-zinc-300">Pension</strong> is modeled as an
            employee contribution of {(IL_EMPLOYEE_PENSION_RATE * 100).toFixed(0)}
            % with the configured contribution tax credit.
          </li>
          <li>
            <strong className="text-zinc-300">Study Fund</strong> models Keren
            Hishtalmut employee contributions up to{" "}
            {(IL_STUDY_FUND_EMPLOYEE_RATE * 100).toFixed(1)}% of the 2026
            monthly qualifying salary ceiling of ILS{" "}
            {IL_STUDY_FUND_MONTHLY_SALARY_CAP.toLocaleString()}, with employer
            matching shown at up to{" "}
            {(IL_STUDY_FUND_EMPLOYER_RATE * 100).toFixed(1)}%.
          </li>
          <li>
            <strong className="text-zinc-300">Section 46 Donations</strong>{" "}
            model a {(IL_SECTION_46_DONATION_CREDIT_RATE * 100).toFixed(0)}%
            non-refundable credit once annual approved donations exceed ILS{" "}
            {IL_SECTION_46_DONATION_MINIMUM.toLocaleString()}, capped at{" "}
            {(IL_SECTION_46_DONATION_LIMIT_RATE * 100).toFixed(0)}% of taxable
            income or ILS{" "}
            {IL_SECTION_46_DONATION_ABSOLUTE_LIMIT.toLocaleString()}.
          </li>
        </ul>
      </div>
    </section>
  );
}
