"use client";

import {
  CalculatorFieldGrid,
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
  SV_AFP_EMPLOYEE_RATE,
  SV_DONATION_NET_INCOME_LIMIT_RATE,
  SV_EDUCATION_EXPENSE_LIMIT,
  SV_ISSS_EMPLOYEE_RATE,
  SV_ISSS_MONTHLY_CAP,
  SV_MEDICAL_EXPENSE_LIMIT,
  SV_VOLUNTARY_AFP_LIMIT_RATE,
} from "@/lib/countries/sv/constants/tax-year-2026";
import type {
  SVCalculatorInputs,
  SVContributionInputs,
} from "@/lib/countries/sv/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function SVCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<SVCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof SVContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof SVContributionInputs,
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

  const renderSlider = (key: keyof SVContributionInputs, step: number) => {
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

  const deductionInputs = [
    renderSlider("retirementContribution", 50),
    renderSlider("medicalExpenses", 25),
    renderSlider("educationExpenses", 25),
    renderSlider("qualifyingExpenses", 25),
    renderSlider("charitableDonations", 25),
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
            id="sv-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        deductionInputs.length > 0 ? (
          <div className="space-y-6">{deductionInputs}</div>
        ) : undefined
      }
      contributionsTitle="El Salvador Deductions"
      contributionsDescription="Voluntary AFP plus annual medical, education, worker-dues, and donation deductions for salary income"
      seoInfo={<ElSalvadorTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models El Salvador salary income using the official withholding
            bands, ISSS and AFP employee deductions, voluntary AFP savings, and
            annual medical, education, worker-dues, and donation deductions.
          </p>
          <p className="mt-2">
            Donation and worker-dues inputs assume the required documentation
            and qualifying recipient status. Bonuses, non-domiciled flat
            taxation, and special Quincena 25 timing are outside this annual
            salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ElSalvadorTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How El Salvador Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            monthly salary withholding table annualized over 12 pay periods.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            include ISSS at {(SV_ISSS_EMPLOYEE_RATE * 100).toFixed(0)}%, capped
            at USD {(SV_ISSS_MONTHLY_CAP * SV_ISSS_EMPLOYEE_RATE).toFixed(0)}{" "}
            per month, and AFP at {(SV_AFP_EMPLOYEE_RATE * 100).toFixed(2)}%.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary AFP</strong> is modeled
            up to {(SV_VOLUNTARY_AFP_LIMIT_RATE * 100).toFixed(0)}% of reported
            pensionable salary.
          </li>
          <li>
            <strong className="text-zinc-300">Annual Deductions</strong> model
            medical expenses up to USD {SV_MEDICAL_EXPENSE_LIMIT.toLocaleString()}{" "}
            and education expenses up to USD{" "}
            {SV_EDUCATION_EXPENSE_LIMIT.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Donations and Dues</strong> model
            documented worker association dues plus qualifying donations capped
            at {(SV_DONATION_NET_INCOME_LIMIT_RATE * 100).toFixed(0)}% of net
            income after the donation.
          </li>
        </ul>
      </div>
    </section>
  );
}
