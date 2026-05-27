"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import {
  EG_SOCIAL_INSURANCE_MONTHLY_CAP,
  EG_SOCIAL_INSURANCE_MONTHLY_MIN,
  getEgyptSocialInsuranceSalaryMonthly,
} from "@/lib/countries/eg/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  EGCalculatorInputs,
  EGContributionInputs,
} from "@/lib/countries/eg/types";
import { clampAmount } from "@/lib/utils";

export default function EGCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<EGCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const insuranceLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const monthlyCashSalary = Math.max(0, inputs.grossSalary) / 12;
  const socialInsuranceSalaryMonthly =
    getEgyptSocialInsuranceSalaryMonthly({
      cashSalary: inputs.grossSalary,
      inputs,
    });
  const socialInsuranceMax = Math.min(
    Math.max(monthlyCashSalary, EG_SOCIAL_INSURANCE_MONTHLY_MIN),
    EG_SOCIAL_INSURANCE_MONTHLY_CAP,
  );

  const setSocialInsuranceCovered = (socialInsuranceCovered: boolean) => {
    setInputs((current) => ({
      ...current,
      socialInsuranceCovered,
      socialInsuranceSalaryMonthly: socialInsuranceCovered
        ? current.socialInsuranceSalaryMonthly
        : 0,
    }));
  };

  const setSocialInsuranceSalaryMonthly = (
    socialInsuranceSalaryMonthly: number,
  ) => {
    setInputs((current) => ({
      ...current,
      socialInsuranceSalaryMonthly:
        current.socialInsuranceCovered === false
          ? 0
          : clampAmount(socialInsuranceSalaryMonthly, socialInsuranceMax),
    }));
  };

  const setContribution = (
    key: keyof EGContributionInputs,
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
            id="eg-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="eg-social-insurance-covered"
            label="Social Insurance Coverage"
            value={inputs.socialInsuranceCovered}
            onChange={setSocialInsuranceCovered}
            trueLabel="Covered by NOSI"
            falseLabel="Exempt / not covered"
            trueFirst
            description="Use exempt only when a confirmed treaty certificate, non-employment setup, or other payroll fact means no Egyptian employee social-insurance deduction applies."
          />
          {inputs.socialInsuranceCovered ? (
            <CurrencyAmountField
              id="eg-social-insurance-salary"
              label="Monthly Social Insurance Salary"
              value={socialInsuranceSalaryMonthly}
              onChange={setSocialInsuranceSalaryMonthly}
              currency={currency}
              min={0}
              max={socialInsuranceMax}
              step={100}
              description={`NOSI contribution salary for 2026. The modeled floor is EGP ${EG_SOCIAL_INSURANCE_MONTHLY_MIN.toLocaleString()} and the ceiling is EGP ${EG_SOCIAL_INSURANCE_MONTHLY_CAP.toLocaleString()} per month.`}
            />
          ) : null}
          <CurrencyAmountField
            id="eg-taxable-employment-benefits"
            label="Taxable Employment Benefits"
            value={inputs.taxableNonCashBenefits ?? 0}
            onChange={(taxableNonCashBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonCashBenefits: Math.max(0, taxableNonCashBenefits),
              }))
            }
            currency={currency}
            min={0}
            step={1000}
            description="Annual taxable allowances or benefits such as spouse/dependant expense reimbursements, school tuition, long-term living expenses, overseas or hardship allowances, and taxable equity compensation."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        insuranceLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.retirementContribution?.name ??
              "Private pension or insurance premiums"
            }
            value={Math.min(
              inputs.contributions.retirementContribution ?? 0,
              insuranceLimit,
            )}
            onChange={(amount) =>
              setContribution("retirementContribution", amount)
            }
            max={insuranceLimit}
            step={Math.max(1, Math.round(insuranceLimit / 100))}
            currency={currency}
            description={
              contributionLimits.retirementContribution?.description ??
              "Deductible registered private pension, life, or health insurance premiums."
            }
          />
        ) : undefined
      }
      contributionsTitle="Egypt Private Pension And Insurance Deduction"
      contributionsDescription="Registered private pension, life, or health insurance premiums that reduce modeled salary tax"
      seoInfo={<EgyptTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Egypt salary tax with the EGP 20,000 employee personal
            exemption, current progressive annual brackets, high-income
            lower-band withdrawal, and employee social insurance on the selected
            monthly NOSI salary.
          </p>
          <p className="mt-2">
            Taxable employment benefits are entered separately because Egypt
            salary tax can include spouse and dependant reimbursements, school
            tuition, long-term living expenses, overseas allowances, hardship
            allowances, and taxable equity compensation. Collective in-kind
            benefits that meet the exemption conditions should not be entered.
          </p>
          <p className="mt-2">
            The optional salary deduction exposed here is the registered
            private pension, life, or health insurance premium cap. Spouse or
            minor-child life and health insurance premiums are handled in that
            same cap; the reviewed salary-tax guidance has no separate family
            allowance.
          </p>
        </InfoPanel>
      }
    />
  );
}

function EgyptTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Egypt Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Salary Tax</strong> applies after
            the EGP 20,000 employee personal exemption and employee social
            insurance.
          </li>
          <li>
            <strong className="text-zinc-300">High-Income Phase-Out</strong>{" "}
            removes lower bands at the published income thresholds.
          </li>
          <li>
            <strong className="text-zinc-300">Registered Premiums</strong> are
            deductible up to the lower of 15% of salary and EGP 10,000.
          </li>
          <li>
            <strong className="text-zinc-300">Social Insurance</strong> uses
            the selected monthly NOSI salary, with the 2026 floor and ceiling
            applied before the 11% employee share.
          </li>
          <li>
            <strong className="text-zinc-300">Benefits</strong> entered in the
            taxable employment benefits field increase salary tax but are not
            treated as cash paid to you.
          </li>
        </ul>
      </div>
    </section>
  );
}
