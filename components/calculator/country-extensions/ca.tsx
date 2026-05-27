"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  type CountryCalculatorExtensionProps,
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import {
  CANADA_FHSA_2026,
  CANADA_PROVINCES,
  CANADA_RPP_2026,
  CANADA_RRSP_2026,
} from "@/lib/countries/ca/constants/tax-year-2026";
import type { CACalculatorInputs } from "@/lib/countries/ca/types";
import { clampAmount } from "@/lib/utils";
import type { CanadaProvinceCode } from "@/lib/countries/ca/constants/tax-year-2026";


function getRrspLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * CANADA_RRSP_2026.contributionRateLimit,
    CANADA_RRSP_2026.annualDollarLimit,
  );
}

function getRppLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * CANADA_RPP_2026.modeledContributionRateLimit,
    CANADA_RPP_2026.moneyPurchaseDollarLimit,
  );
}

export default function CACountryExtension({ country }: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<CACalculatorInputs>(country);
  const rrspLimit = getRrspLimit(inputs.grossSalary);
  const rppLimit = getRppLimit(inputs.grossSalary);
  const selectedProvince = CANADA_PROVINCES.find((province) => province.code === inputs.province);

  const updateInputs = (updater: (current: CACalculatorInputs) => CACalculatorInputs) => {
    setInputs((current) => {
      const next = updater(current);
      const nextRrspLimit = getRrspLimit(next.grossSalary);
      const nextRppLimit = getRppLimit(next.grossSalary);
      return {
        ...next,
        contributions: {
          rrspContribution: clampAmount(next.contributions.rrspContribution, nextRrspLimit),
          fhsaContribution: clampAmount(next.contributions.fhsaContribution, CANADA_FHSA_2026.annualDollarLimit),
          registeredPensionContribution: clampAmount(next.contributions.registeredPensionContribution, nextRppLimit),
          unionDues: Math.max(0, next.contributions.unionDues),
          childcareExpenses: Math.max(0, next.contributions.childcareExpenses),
        },
      };
    });
  };

  const updateContribution = (
    key: keyof CACalculatorInputs["contributions"],
    value: number,
  ) => {
    updateInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: value,
      },
    }));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        updateInputs((current) => ({ ...current, grossSalary }))
      }
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField<CanadaProvinceCode>
            id="ca-province"
            label="Province / Territory"
            value={inputs.province}
            onChange={(province) =>
              updateInputs((current) => ({ ...current, province }))
            }
            options={CANADA_PROVINCES.map((province) => ({
              value: province.code,
              label: province.name,
            }))}
            description="Applies the selected provincial or territorial tax brackets."
          />
          <PayFrequencyField
            id="ca-pay-frequency"
            value={inputs.payFrequency}
            onChange={(payFrequency) =>
              updateInputs((current) => ({ ...current, payFrequency }))
            }
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="RRSP Contribution"
            description="Tax-deductible registered retirement savings contribution."
            value={inputs.contributions.rrspContribution}
            onChange={(value) => updateContribution("rrspContribution", value)}
            max={rrspLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="FHSA Contribution"
            description="Tax-deductible first home savings account contribution."
            value={inputs.contributions.fhsaContribution}
            onChange={(value) => updateContribution("fhsaContribution", value)}
            max={CANADA_FHSA_2026.annualDollarLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="Registered Pension / RPP"
            description="Employee registered pension plan contribution, modeled as pre-tax."
            value={inputs.contributions.registeredPensionContribution}
            onChange={(value) => updateContribution("registeredPensionContribution", value)}
            max={rppLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="Union / Professional Dues"
            description="Modeled as a taxable-income deduction."
            value={inputs.contributions.unionDues}
            onChange={(value) => updateContribution("unionDues", value)}
            max={Math.max(10_000, inputs.contributions.unionDues)}
            step={50}
            currency={currency}
          />
          <ContributionSlider
            label="Childcare Expenses"
            description="Modeled as a taxable-income deduction for eligible childcare costs."
            value={inputs.contributions.childcareExpenses}
            onChange={(value) => updateContribution("childcareExpenses", value)}
            max={Math.max(25_000, inputs.contributions.childcareExpenses)}
            step={100}
            currency={currency}
          />
        </div>
      }
      contributionsTitle="Retirement, Benefits & Deductions"
      contributionsDescription="RRSP, FHSA, pension, dues, and childcare deductions"
      infoCard={
        <InfoPanel title="Modeled Scope">
          Uses 2026 federal and {selectedProvince?.name ?? "selected province"} brackets.
          Quebec uses QPP/QPP2, QPIP, and reduced EI; other provinces and territories
          use CPP/CPP2 and EI. Canada has no US-style joint filing brackets; spouse
          and dependent credits are not modeled in this payroll view.
        </InfoPanel>
      }
      seoInfo={
        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Canada salary after tax calculator by province</h2>
          <p>
            Estimate Canadian take-home pay using federal and selected provincial or
            territorial income tax, CPP/CPP2 or Quebec QPP/QPP2, EI, Quebec QPIP,
            RRSP, FHSA, registered pension, union dues, and childcare deductions.
          </p>
        </section>
      }
    />
  );
}
