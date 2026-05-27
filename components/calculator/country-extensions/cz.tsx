"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberStepperField,
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
  CZBenefitInputs,
  CZCalculatorInputs,
  CZCompanyCarEmissionType,
  CZContributionInputs,
  CZDisabilityCreditType,
  CZResidencyType,
} from "@/lib/countries/cz/types";

const RESIDENCY_OPTIONS: Array<{
  value: CZResidencyType;
  label: string;
}> = [
  { value: "resident", label: "Czech tax resident" },
  { value: "non_resident", label: "Non-resident" },
];

const DISABILITY_OPTIONS: Array<{
  value: CZDisabilityCreditType;
  label: string;
}> = [
  { value: "none", label: "No disability credit" },
  { value: "basic", label: "Basic disability credit" },
  { value: "extended", label: "Extended disability credit" },
];

const COMPANY_CAR_EMISSION_OPTIONS: Array<{
  value: CZCompanyCarEmissionType;
  label: string;
}> = [
  { value: "standard", label: "Standard vehicle (1%)" },
  { value: "lowEmission", label: "Low-emission vehicle (0.5%)" },
  { value: "zeroEmission", label: "Zero-emission vehicle (0.25%)" },
];

function clampAmount(value: number, max: number): number {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clampMonths(value: number): number {
  return Math.min(Math.max(0, Math.floor(value)), 12);
}

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
                hasSpouseZtpP: false,
                disabilityCreditType: "none",
                hasZtpPCard: false,
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

  const setBenefit = <K extends keyof CZBenefitInputs>(
    key: K,
    value: CZBenefitInputs[K],
  ) => {
    setInputs((current) => ({
      ...current,
      benefits: {
        ...current.benefits,
        [key]: value,
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
        <div className="space-y-6">
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
            <NumberStepperField
              id="cz-children"
              label="Children for Tax Credit"
              value={inputs.taxReliefs.numberOfChildren}
              onChange={(value) =>
                setTaxRelief(
                  "numberOfChildren",
                  Math.max(0, Math.floor(value)),
                )
              }
              min={0}
              max={10}
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
            <BooleanSelectField
              id="cz-spouse-ztp"
              label="Spouse Has ZTP/P"
              value={inputs.taxReliefs.hasSpouseZtpP}
              onChange={(value) => setTaxRelief("hasSpouseZtpP", value)}
              trueLabel="Yes"
              falseLabel="No"
              description="Doubles the resident spouse credit when the spouse credit applies."
            />
            <SelectField
              id="cz-disability-credit"
              label="Disability Credit"
              value={inputs.taxReliefs.disabilityCreditType}
              onChange={(value) => setTaxRelief("disabilityCreditType", value)}
              options={DISABILITY_OPTIONS}
              description="Resident taxpayer disability credit for pension I/II or III degree."
            />
            <BooleanSelectField
              id="cz-ztp-card"
              label="Taxpayer ZTP/P Card"
              value={inputs.taxReliefs.hasZtpPCard}
              onChange={(value) => setTaxRelief("hasZtpPCard", value)}
              trueLabel="Yes"
              falseLabel="No"
              description="Adds the annual resident credit for a ZTP/P card holder."
            />
          </CalculatorFieldGrid>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-200">
                Taxable Employment Benefits
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Enter taxable payroll benefit values separately from cash
                salary; they increase Czech tax and insurance bases but not cash
                received.
              </p>
            </div>
            <CalculatorFieldGrid columns={2}>
              <CurrencyAmountField
                id="cz-other-taxable-benefits"
                label="Other Taxable Non-Cash Benefits"
                value={inputs.benefits.otherTaxableNonCashBenefits}
                onChange={(value) =>
                  setBenefit("otherTaxableNonCashBenefits", clampNonNegative(value))
                }
                currency={currency}
                step={1000}
                description="Employer-valued taxable housing, above-limit meals, over-limit benefit-card amounts, or employer retirement contributions above the exempt limit."
              />
              <CurrencyAmountField
                id="cz-company-car-entry-price"
                label="Company Car Entry Price"
                value={inputs.benefits.companyCarEntryPrice}
                onChange={(value) =>
                  setBenefit("companyCarEntryPrice", clampNonNegative(value))
                }
                currency={currency}
                step={10000}
                description="Vehicle acquisition price including VAT for private-use valuation."
              />
              <SelectField
                id="cz-company-car-emissions"
                label="Company Car Emissions"
                value={inputs.benefits.companyCarEmissionType}
                onChange={(value) => setBenefit("companyCarEmissionType", value)}
                options={COMPANY_CAR_EMISSION_OPTIONS}
                description="Monthly taxable benefit is 1%, 0.5%, or 0.25% of the entry price, with a CZK 1,000 monthly floor."
              />
              <NumberStepperField
                id="cz-company-car-months"
                label="Company Car Months"
                value={inputs.benefits.companyCarMonths}
                onChange={(value) =>
                  setBenefit("companyCarMonths", clampMonths(value))
                }
                min={0}
                max={12}
                description="Number of started calendar months with private use."
              />
            </CalculatorFieldGrid>
          </div>
        </div>
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
          taxable employment benefits, employee social security, employee
          public health insurance, the basic taxpayer credit, selected resident
          family credits, retirement-product deductions, and gift deductions.
          OSVC, paušální daň, DPP/DPČ threshold cases, minimum health-insurance
          top-ups, working-pensioner discounts, and employer-side-only cost
          regimes are excluded.
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
              child, spouse, disability, and ZTP/P credits against the computed
              tax.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              Payroll Contributions
            </h2>
            <p>
              Employee social security is modeled at 7.1% up to the 2026 annual
              assessment ceiling. Public health insurance is modeled at 4.5% of
              cash salary plus taxable benefits for the employee, with employer
              contributions shown separately in the results.
            </p>
          </div>
        </section>
      }
    />
  );
}
