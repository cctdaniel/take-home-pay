"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CountStepperField,
  PayFrequencyField,
  SelectField,
  type SelectOption,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  CROATIA_LOCAL_TAX_RATES_2026,
  type HRLocalityCode,
} from "@/lib/countries/hr/constants/tax-brackets-2026";
import type {
  HRCalculatorInputs,
  HRPensionScheme,
  HRResidencyType,
} from "@/lib/countries/hr/types";

const LOCALITY_OPTIONS: SelectOption<HRLocalityCode>[] =
  CROATIA_LOCAL_TAX_RATES_2026.map((locality) => ({
    value: locality.code,
    label: `${locality.name} (${(locality.lowerRate * 100).toFixed(1)}% / ${(
      locality.higherRate * 100
    ).toFixed(1)}%)`,
  }));

const PENSION_SCHEME_OPTIONS: SelectOption<HRPensionScheme>[] = [
  {
    value: "pillar_1_and_2",
    label: "I + II pillars (15% + 5%)",
  },
  {
    value: "pillar_1_only",
    label: "I pillar only (20%)",
  },
];

export default function HRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<HRCalculatorInputs>(country);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={3}>
          <SelectField
            id="hr-residency-type"
            label="Residency Status"
            value={inputs.residencyType}
            onChange={(residencyType: HRResidencyType) =>
              setInputs((current) => ({ ...current, residencyType }))
            }
            options={[
              { value: "resident", label: "Croatian Tax Resident" },
              { value: "non_resident", label: "Non-Resident" },
            ]}
            description={
              inputs.residencyType === "non_resident"
                ? "Family allowance additions are not applied"
                : undefined
            }
          />
          <SelectField
            id="hr-locality"
            label="Local Tax Rate"
            value={inputs.locality}
            onChange={(locality: HRLocalityCode) =>
              setInputs((current) => ({ ...current, locality }))
            }
            options={LOCALITY_OPTIONS}
            description="Rates are set by local self-government units"
          />
          <SelectField
            id="hr-pension-scheme"
            label="Pension Scheme"
            value={inputs.pensionScheme}
            onChange={(pensionScheme: HRPensionScheme) =>
              setInputs((current) => ({ ...current, pensionScheme }))
            }
            options={PENSION_SCHEME_OPTIONS}
            description="Both options deduct 20% total pension contribution"
          />
          <BooleanSelectField
            id="hr-dependent-spouse"
            label="Dependent Spouse"
            value={inputs.hasDependentSpouse}
            onChange={(hasDependentSpouse) =>
              setInputs((current) => ({ ...current, hasDependentSpouse }))
            }
            trueLabel="Yes"
            falseLabel="No"
            description="Resident personal allowance addition"
          />
          <CountStepperField
            spanColumns={3}
            id="hr-number-of-children"
            label="Dependent Children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfChildren: Math.min(8, Math.max(0, numberOfChildren)),
              }))
            }
            max={8}
            description="Resident child allowance additions"
          />
          <PayFrequencyField
            id="hr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Croatian payroll income tax does not allow employee-paid voluntary third-pillar pension premiums as a salary deduction. Mandatory pension pillars I and II are already deducted from gross before tax."
          mandatoryLabel="Employee pension (15% + 5% or 20% pillar I only) and local income tax after personal allowance."
          sourceUrl="https://porezna-uprava.gov.hr/hr/porezne-stope-godisnjeg-poreza-na-dohodak/4764"
          sourceLabel="Croatian Tax Administration"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No employee voluntary income-tax relief on Croatian payroll salary"
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Croatian employment salary for a full tax year.
            Employee pension is deducted from gross salary before income tax;
            employer health insurance is shown in results but not deducted from
            take-home pay.
          </p>
          <p className="mt-2">
            Digital-nomad temporary stay, foreign-employer income, employer-paid
            voluntary pension premiums, benefits in kind, and special hire or
            returnee exemptions are outside this salary calculator.
          </p>
        </InfoPanel>
      }
    />
  );
}
