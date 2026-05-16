"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
  NumberField,
  BooleanSelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import type {
  CNCalculatorInputs,
  CNSpecialDeductions,
} from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

const HOUSING_FUND_RATE_OPTIONS = [
  { value: "0.05", label: "5%" },
  { value: "0.06", label: "6%" },
  { value: "0.07", label: "7%" },
  { value: "0.08", label: "8%" },
  { value: "0.09", label: "9%" },
  { value: "0.10", label: "10%" },
  { value: "0.11", label: "11%" },
  { value: "0.12", label: "12%" },
];

const HOUSING_RENT_CITY_OPTIONS = [
  { value: "none" as const, label: "None" },
  { value: "tier1" as const, label: "Tier 1 (1,500 CNY/mo)" },
  { value: "tier2" as const, label: "Tier 2 (1,100 CNY/mo)" },
  { value: "tier3" as const, label: "Tier 3 (800 CNY/mo)" },
];

export default function CNCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<CNCalculatorInputs>(country);

  const sd = inputs.specialDeductions;

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <div className="space-y-4">
          <CalculatorFieldGrid columns={2}>
            <NumberField
              id="cn-social-insurance-base"
              label="Social Insurance Base (monthly)"
              value={inputs.socialInsuranceBase}
              onChange={(socialInsuranceBase) =>
                setInputs((current) => ({ ...current, socialInsuranceBase }))
              }
              min={0}
              step={100}
              description="Monthly base salary for social insurance calculation (capped at 36,000 CNY)"
            />
            <SelectField
              id="cn-housing-fund-rate"
              label="Housing Fund Rate"
              value={String(inputs.housingFundRate)}
              onChange={(v) =>
                setInputs((current) => ({
                  ...current,
                  housingFundRate: parseFloat(v),
                }))
              }
              options={HOUSING_FUND_RATE_OPTIONS}
              description="PRC Housing Provident Fund employee contribution rate"
            />
          </CalculatorFieldGrid>

          <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />

          <p className="text-xs font-medium text-zinc-400">Special Additional Deductions (专项附加扣除)</p>
          <CalculatorFieldGrid columns={2}>
            <NumberField
              id="cn-children"
              label="Children (age 3+)"
              value={sd.numberOfChildren}
              onChange={(numberOfChildren) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: { ...current.specialDeductions, numberOfChildren },
                }))
              }
              min={0}
              max={10}
              description="2,000 CNY/month per child"
            />
            <NumberField
              id="cn-children-under3"
              label="Children under 3"
              value={sd.numberOfChildrenUnder3}
              onChange={(numberOfChildrenUnder3) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: {
                    ...current.specialDeductions,
                    numberOfChildrenUnder3,
                  },
                }))
              }
              min={0}
              max={10}
              description="2,000 CNY/month per child"
            />
            <NumberField
              id="cn-elderly-care"
              label="Elderly dependents"
              value={sd.numberOfElderlyCare}
              onChange={(numberOfElderlyCare) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: {
                    ...current.specialDeductions,
                    numberOfElderlyCare,
                  },
                }))
              }
              min={0}
              max={4}
              description="3,000/mo (only child) or 1,500/mo (shared)"
            />
            <BooleanSelectField
              id="cn-only-child"
              label="Only Child"
              value={sd.isOnlyChild}
              onChange={(isOnlyChild) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: {
                    ...current.specialDeductions,
                    isOnlyChild,
                  },
                }))
              }
              description="Affects elderly care deduction: 3,000 vs 1,500/month"
            />
          </CalculatorFieldGrid>

          <CalculatorFieldGrid columns={2}>
            <SelectField
              id="cn-housing-rent-city"
              label="Housing Rent City"
              value={sd.housingRentCity}
              onChange={(housingRentCity: CNSpecialDeductions["housingRentCity"]) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: {
                    ...current.specialDeductions,
                    housingRentCity,
                    housingLoanInterest:
                      housingRentCity !== "none"
                        ? false
                        : current.specialDeductions.housingLoanInterest,
                  },
                }))
              }
              options={HOUSING_RENT_CITY_OPTIONS}
              description="Mutually exclusive with mortgage interest deduction"
            />
            <BooleanSelectField
              id="cn-housing-loan"
              label="First Home Mortgage Interest"
              value={sd.housingLoanInterest}
              onChange={(housingLoanInterest) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: {
                    ...current.specialDeductions,
                    housingLoanInterest,
                    housingRentCity: housingLoanInterest
                      ? "none"
                      : current.specialDeductions.housingRentCity,
                  },
                }))
              }
              description="1,000 CNY/month (mutually exclusive with rent)"
            />
            <BooleanSelectField
              id="cn-continuing-ed"
              label="Continuing Education"
              value={sd.continuingEducation}
              onChange={(continuingEducation) =>
                setInputs((current) => ({
                  ...current,
                  specialDeductions: {
                    ...current.specialDeductions,
                    continuingEducation,
                  },
                }))
              }
              description="400 CNY/month for self continuing education"
            />
          </CalculatorFieldGrid>

          <InfoPanel title="China assumptions" tone="neutral">
            Modeled with 2026 IIT brackets (3–45%), social insurance at national
            guidance rates (pension 8%, medical 2%, unemployment 0.5%), and
            housing fund at the selected rate (5–12%). Standard deduction is
            60,000 CNY/year. Social insurance ceilings use Tier 1 city caps
            (36,000 CNY/month). Employer contributions, local city variations,
            and year-end bonus tax treatment are excluded.
          </InfoPanel>
        </div>
      }
    />
  );
}
