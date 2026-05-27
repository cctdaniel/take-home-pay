import { describe, expect, it } from "vitest";
import { BSCalculator } from "./calculator";
import {
  BS_NIB_AGE_65_PLUS_NOT_RETIRED_EMPLOYEE_RATE,
  BS_NIB_EMPLOYER_ONLY_RATE,
  BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE,
  BS_NIB_HALF_WEEKLY_CEILING,
  BS_NIB_STANDARD_EMPLOYEE_RATE,
  BS_NIB_WEEKLY_CEILING,
} from "./constants/tax-year-2026";
import type { BSBreakdown, BSCalculatorInputs } from "./types";

function inputs(
  overrides: Partial<BSCalculatorInputs> = {},
): BSCalculatorInputs {
  const defaults = BSCalculator.getDefaultInputs() as BSCalculatorInputs;

  return {
    ...defaults,
    grossSalary: 60_000,
    payFrequency: "annual",
    ...overrides,
    contributions: {
      ...defaults.contributions,
      ...overrides.contributions,
    },
  };
}

describe("Bahamas calculator", () => {
  it("models standard employment with no PIT and employee NIB up to the weekly ceiling", () => {
    const result = BSCalculator.calculate(inputs());
    const expectedNib =
      BS_NIB_WEEKLY_CEILING * 52 * BS_NIB_STANDARD_EMPLOYEE_RATE;

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(expectedNib);
    expect(result.netSalary).toBe(58_041.42);
    expect(result.breakdown).toMatchObject({
      nibCategory: "standard",
      nibInsurableWeeklyWage: BS_NIB_WEEKLY_CEILING,
      nibBasicWageEmployeeRate: BS_NIB_STANDARD_EMPLOYEE_RATE,
    });
  });

  it("uses the current age 65+ not receiving Retirement Benefit employee rate", () => {
    const result = BSCalculator.calculate(
      inputs({ nibCategory: "age65PlusNotRetired" }),
    );
    const expectedNib =
      BS_NIB_WEEKLY_CEILING *
      52 *
      BS_NIB_AGE_65_PLUS_NOT_RETIRED_EMPLOYEE_RATE;

    expect(result.taxes.socialContributions).toBe(expectedNib);
    expect(result.netSalary).toBe(58_252.02);
  });

  it("shows age 65+ Retirement Benefit employment as employer-only NIB context", () => {
    const result = BSCalculator.calculate(
      inputs({ nibCategory: "age65PlusRetirementBenefit" }),
    );
    const breakdown = result.breakdown as BSBreakdown;

    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(60_000);
    expect(breakdown.nibEmployerOnlyContributionAnnual).toBe(
      BS_NIB_WEEKLY_CEILING * 52 * BS_NIB_EMPLOYER_ONLY_RATE,
    );
  });

  it("caps age 60-64 Retirement Benefit employment at half of the weekly ceiling", () => {
    const result = BSCalculator.calculate(
      inputs({ nibCategory: "age60to64RetirementBenefit" }),
    );
    const breakdown = result.breakdown as BSBreakdown;

    expect(result.taxes.socialContributions).toBe(0);
    expect(breakdown.nibInsurableWeeklyWage).toBe(BS_NIB_HALF_WEEKLY_CEILING);
    expect(breakdown.nibEmployerOnlyContributionAnnual).toBe(
      BS_NIB_HALF_WEEKLY_CEILING * 52 * BS_NIB_EMPLOYER_ONLY_RATE,
    );
  });

  it("applies the formal gratuity employee rate separately from basic wages", () => {
    const result = BSCalculator.calculate(
      inputs({ weeklyFormalGratuities: 100 }),
    );
    const breakdown = result.breakdown as BSBreakdown;
    const expectedBasicNib =
      (BS_NIB_WEEKLY_CEILING - 100) * 52 * BS_NIB_STANDARD_EMPLOYEE_RATE;
    const expectedGratuityNib =
      100 * 52 * BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE;

    expect(breakdown.nibInsurableWeeklyWage).toBe(710);
    expect(breakdown.weeklyFormalGratuities).toBe(100);
    expect(breakdown.annualFormalGratuities).toBe(5_200);
    expect(result.taxes.socialContributions).toBe(
      expectedBasicNib + expectedGratuityNib,
    );
    expect(result.netSalary).toBe(57_695.62);
  });

  it("clamps formal gratuities to the weekly ceiling and leaves no basic wage base", () => {
    const result = BSCalculator.calculate(
      inputs({ weeklyFormalGratuities: 1_000 }),
    );
    const breakdown = result.breakdown as BSBreakdown;

    expect(breakdown.weeklyFormalGratuities).toBe(BS_NIB_WEEKLY_CEILING);
    expect(breakdown.nibInsurableWeeklyWage).toBe(0);
    expect(result.taxes.socialContributions).toBe(
      BS_NIB_WEEKLY_CEILING * 52 * BS_NIB_FORMAL_GRATUITIES_EMPLOYEE_RATE,
    );
  });
});
