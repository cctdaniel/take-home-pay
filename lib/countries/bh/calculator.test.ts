import { describe, expect, it } from "vitest";
import { BHCalculator } from "./calculator";
import type { BHCalculatorInputs, BHWorkerType } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<BHCalculatorInputs> = {},
): BHCalculatorInputs {
  return {
    country: "BH",
    grossSalary,
    payFrequency: "annual",
    workerType: "expatriate",
    sioBasicWageMonthly: 0,
    sioRecurringAllowancesMonthly: 0,
    sioContributoryWageMonthly: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

describe("Bahrain calculator", () => {
  it("models expatriate salary with 0% PIT and 1% unemployment insurance", () => {
    const result = BHCalculator.calculate(inputs(36_000));

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(360);
    expect(result.netSalary).toBe(35_640);
    expect(result.breakdown).toMatchObject({
      workerType: "expatriate",
      sioBasicWageMonthly: 3_000,
      sioRecurringAllowancesMonthly: 0,
      sioSelectedWageMonthly: 3_000,
      sioContributoryWageMonthly: 3_000,
      sioContributoryWageAnnual: 36_000,
    });
  });

  it("adds the Bahraini pension employee share when Bahraini coverage is selected", () => {
    const result = BHCalculator.calculate(
      inputs(36_000, {
        workerType: "bahraini" satisfies BHWorkerType,
      }),
    );

    expect(result.taxes.socialContributions).toBe(2_880);
    expect(result.netSalary).toBe(33_120);
  });

  it("caps the monthly SIO contribution base at BHD 4,000", () => {
    const result = BHCalculator.calculate(inputs(72_000));

    expect(result.taxes.socialContributions).toBe(480);
    expect(result.netSalary).toBe(71_520);
    expect(result.breakdown).toMatchObject({
      sioSelectedWageMonthly: 6_000,
      sioContributoryWageMonthly: 4_000,
      sioContributoryWageAnnual: 48_000,
    });
  });

  it("models basic wage and recurring allowances as separate SIO wage components", () => {
    const result = BHCalculator.calculate(
      inputs(36_000, {
        sioBasicWageMonthly: 2_000,
        sioRecurringAllowancesMonthly: 500,
      }),
    );

    expect(result.taxes.socialContributions).toBe(300);
    expect(result.netSalary).toBe(35_700);
    expect(result.breakdown).toMatchObject({
      sioBasicWageMonthly: 2_000,
      sioRecurringAllowancesMonthly: 500,
      sioSelectedWageMonthly: 2_500,
      sioContributoryWageMonthly: 2_500,
      sioContributoryWageAnnual: 30_000,
    });
  });
});
