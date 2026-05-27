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
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  KE_DISABILITY_EXEMPTION_LIMIT,
  KE_INSURANCE_RELIEF_LIMIT,
  KE_MORTGAGE_INTEREST_LIMIT,
  KE_NON_CASH_BENEFIT_EXEMPT_LIMIT,
  KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT,
} from "@/lib/countries/ke/constants/tax-year-2026";
import type {
  KECalculatorInputs,
  KEContributionInputs,
} from "@/lib/countries/ke/types";
import { clampAmount } from "@/lib/utils";

export default function KECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<KECalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof KEContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof KEContributionInputs,
    amount: number,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, getLimit(key)),
      },
    }));
  };

  const renderSlider = (
    key: keyof KEContributionInputs,
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
        description={contributionLimits[key]?.description ?? fallbackDescription}
      />
    );
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
            id="ke-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <BooleanSelectField
            id="ke-pwd-exemption"
            label="PWD Exemption Certificate"
            value={inputs.hasDisabilityExemptionCertificate}
            onChange={(hasDisabilityExemptionCertificate) =>
              setInputs((current) => ({
                ...current,
                hasDisabilityExemptionCertificate,
              }))
            }
            trueLabel="Valid certificate"
            falseLabel="No certificate"
            description="Applies KRA's disability exemption to the first KES 150,000 per month when a valid certificate is held."
          />
          <CurrencyAmountField
            id="ke-taxable-non-cash-benefits"
            label="Taxable Non-Cash Benefits"
            value={inputs.taxableNonCashBenefits}
            onChange={(taxableNonCashBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonCashBenefits: Math.max(0, taxableNonCashBenefits),
              }))
            }
            currency={currency}
            step={10000}
            description={`Enter the annual taxable value above KRA's KES ${KE_NON_CASH_BENEFIT_EXEMPT_LIMIT.toLocaleString()} non-cash benefit threshold.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {renderSlider(
            "retirementContribution",
            "Registered pension or retirement fund contribution",
            "Additional registered pension or retirement fund contribution.",
            1000,
          )}
          {renderSlider(
            "medicalExpenses",
            "Post-retirement medical fund contribution",
            "Contribution to a post-retirement medical fund.",
            1000,
          )}
          {renderSlider(
            "housingExpenses",
            "Owner-occupied mortgage interest",
            "Qualifying mortgage interest on owner-occupied residential premises.",
            1000,
          )}
          {renderSlider(
            "qualifyingExpenses",
            "Qualifying insurance premiums",
            "Life, health, or education insurance premiums for insurance relief.",
            1000,
          )}
        </div>
      }
      contributionsTitle="Kenya PAYE Reliefs and Deductions"
      contributionsDescription="Registered pension, post-retirement medical fund, mortgage interest, insurance relief, and PWD exemption inputs"
      seoInfo={<KenyaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Kenya PAYE for ordinary employment income, including
            PAYE bands, personal relief, employee NSSF, SHIF, Affordable Housing
            Levy, and KRA-declared employee deductions and reliefs.
          </p>
          <p className="mt-2">
            Taxable non-cash benefits are modeled as PAYE income above. Car,
            housing, low-interest loan, meal, and excess employer pension
            valuation worksheets remain employer-specific, so enter the taxable
            annual value after applying KRA exemption thresholds.
          </p>
        </InfoPanel>
      }
    />
  );
}

function KenyaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Kenya Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">PAYE</strong> uses KRA individual
            bands, personal relief of KES 28,800 per year, and employee payroll
            deductions for NSSF, SHIF, and the Affordable Housing Levy.
          </li>
          <li>
            <strong className="text-zinc-300">Retirement and Medical Funds</strong>{" "}
            model the registered pension limit after NSSF plus post-retirement
            medical fund contributions up to KES{" "}
            {KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT.toLocaleString()} per year.
          </li>
          <li>
            <strong className="text-zinc-300">Mortgage Interest</strong> is
            modeled up to KES {KE_MORTGAGE_INTEREST_LIMIT.toLocaleString()} per
            year for qualifying owner-occupied residential premises.
          </li>
          <li>
            <strong className="text-zinc-300">Insurance Relief</strong> is 15%
            of qualifying premiums, capped at KES{" "}
            {KE_INSURANCE_RELIEF_LIMIT.toLocaleString()} of annual relief.
          </li>
          <li>
            <strong className="text-zinc-300">PWD Exemption</strong> applies up
            to KES {KE_DISABILITY_EXEMPTION_LIMIT.toLocaleString()} per year
            when a valid exemption certificate is held.
          </li>
          <li>
            <strong className="text-zinc-300">Non-Cash Benefits</strong> are
            added to the PAYE base when you enter a taxable annual value for
            car, housing, low-interest loan, meal, or similar employment
            benefits.
          </li>
        </ul>
      </div>
    </section>
  );
}
