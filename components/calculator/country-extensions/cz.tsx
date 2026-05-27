"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberField,
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
import { CZCalculator } from "@/lib/countries/cz";
import type {
  CZCalculatorInputs,
  CZContributionInputs,
  CZResidencyType,
} from "@/lib/countries/cz/types";
import { clampAmount } from "@/lib/utils";

const RESIDENCY_OPTIONS: Array<{
  value: CZResidencyType;
  label: string;
}> = [
  { value: "resident", label: "Czech tax resident" },
  { value: "non_resident", label: "Non-resident" },
];

export default function CZCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<CZCalculatorInputs>(country);
  const limits = CZCalculator.getContributionLimits(inputs);
  const isResident = inputs.residencyType === "resident";

  const setResidencyType = (residencyType: CZResidencyType) => {
    setInputs((current) => ({
      ...current,
      residencyType,
      contributions:
        residencyType === "resident"
          ? current.contributions
          : {
              retirementSavingsContribution: 0,
              charitableDonations: 0,
            },
      taxReliefs:
        residencyType === "resident"
          ? current.taxReliefs
          : {
              numberOfChildren: 0,
              hasSpouseCredit: false,
            },
    }));
  };

  const setTaxRelief = <K extends keyof CZCalculatorInputs["taxReliefs"]>(
    key: K,
    value: CZCalculatorInputs["taxReliefs"][K],
  ) => {
    setInputs((current) => ({
      ...current,
      taxReliefs: {
        ...current.taxReliefs,
        [key]: value,
      },
    }));
  };

  const setContribution = <K extends keyof CZContributionInputs>(
    key: K,
    value: number,
  ) => {
    const limit = limits[key]?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(value, limit),
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
          <SelectField
            id="cz-residency"
            label="Tax Residency"
            value={inputs.residencyType}
            onChange={setResidencyType}
            options={RESIDENCY_OPTIONS}
            description="Resident mode includes Czech resident credits and deductions."
          />
          <PayFrequencyField
            id="cz-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberField
            id="cz-children"
            label="Children for Tax Credit"
            value={inputs.taxReliefs.numberOfChildren}
            onChange={(value) =>
              setTaxRelief("numberOfChildren", Math.max(0, Math.floor(value)))
            }
            min={0}
            max={10}
            fallbackValue={0}
            description="Applies resident child tax credit rates by child order."
          />
          <BooleanSelectField
            id="cz-spouse-credit"
            label="Spouse Credit Eligible"
            value={inputs.taxReliefs.hasSpouseCredit}
            onChange={(value) => setTaxRelief("hasSpouseCredit", value)}
            trueLabel="Eligible"
            falseLabel="No"
            description="Full-year spouse income <= CZK 68,000 and a dependent child under age 3."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        isResident ? (
          <div className="space-y-6">
            <ContributionSlider
              label="Retirement and Long-Term Products"
              value={inputs.contributions.retirementSavingsContribution}
              onChange={(value) =>
                setContribution("retirementSavingsContribution", value)
              }
              max={limits.retirementSavingsContribution?.limit ?? 0}
              step={1_000}
              currency={currency}
              description="Deductible own contributions to tax-supported old-age savings, DIP, life insurance, or long-term care products."
            />
            <ContributionSlider
              label="Qualifying Charitable Gifts"
              value={inputs.contributions.charitableDonations}
              onChange={(value) => setContribution("charitableDonations", value)}
              max={limits.charitableDonations?.limit ?? 0}
              step={1_000}
              currency={currency}
              description="Deductible gifts are capped at 30% of the modeled tax base for 2026."
            />
          </div>
        ) : undefined
      }
      contributionsTitle="Tax-Deductible Amounts"
      contributionsDescription="Resident deductions that reduce the annual Czech income tax base"
      infoCard={
        <InfoPanel title="Czechia model assumptions">
          Ordinary employment salary is modeled with 15%/23% income tax,
          employee social security, employee public health insurance, the basic
          taxpayer credit, selected resident family credits, retirement-product
          deductions, and gift deductions. OSVC, paušální daň, DPP/DPČ threshold
          cases, minimum health-insurance top-ups, working-pensioner discounts,
          disability/ZTP credits, and employer benefit exemptions are excluded.
        </InfoPanel>
      }
      seoInfo={
        <section className="mt-8 grid gap-6 text-sm text-zinc-400 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              2026 Czech Salary Tax Model
            </h2>
            <p>
              Czech employment income tax applies 15% to the annual tax base up
              to 36 times the 2026 average wage and 23% above that threshold.
              This calculator applies the basic taxpayer credit and resident
              child/spouse credits against the computed tax.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              Payroll Contributions
            </h2>
            <p>
              Employee social security is modeled at 7.1% up to the 2026 annual
              assessment ceiling. Public health insurance is modeled at 4.5% of
              gross salary for the employee, with employer contributions shown
              separately in the results.
            </p>
          </div>
        </section>
      }
    />
  );
}
