import { describe, expect, it } from "vitest";
import { SACalculator } from "./calculator";
import type { SACalculatorInputs, SAWorkerType } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<SACalculatorInputs> = {},
): SACalculatorInputs {
  return {
    country: "SA",
    grossSalary,
    payFrequency: "annual",
    workerType: "expatriate",
    gosiBasicWageMonthly: 0,
    housingAllowanceType: "none",
    cashHousingAllowanceMonthly: 0,
    gosiContributoryWageMonthly: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

describe("Saudi Arabia calculator", () => {
  it("models expatriate employment earnings with no Saudi PIT or employee GOSI", () => {
    const result = SACalculator.calculate(inputs(360_000));

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(360_000);
  });

  it("applies existing-system Saudi GOSI and SANED to the selected wage base", () => {
    const result = SACalculator.calculate(
      inputs(360_000, {
        workerType: "saudi_standard" satisfies SAWorkerType,
      }),
    );

    expect(result.taxes.socialContributions).toBe(35_100);
    expect(result.netSalary).toBe(324_900);
    expect(result.breakdown).toMatchObject({
      workerType: "saudi_standard",
      gosiContributoryWageMonthly: 30_000,
      gosiContributoryWageAnnual: 360_000,
    });
  });

  it("applies the 2026 new-system blended GOSI rate and monthly cap", () => {
    const result = SACalculator.calculate(
      inputs(600_000, {
        workerType: "saudi_new_system_2026" satisfies SAWorkerType,
      }),
    );

    expect(result.taxes.socialContributions).toBe(56_700);
    expect(result.netSalary).toBe(543_300);
    expect(result.breakdown).toMatchObject({
      workerType: "saudi_new_system_2026",
      gosiContributoryWageMonthly: 45_000,
      gosiContributoryWageAnnual: 540_000,
    });
  });

  it("builds the GOSI wage base from basic wage and cash housing allowance", () => {
    const result = SACalculator.calculate(
      inputs(360_000, {
        workerType: "saudi_standard" satisfies SAWorkerType,
        gosiBasicWageMonthly: 20_000,
        housingAllowanceType: "cash",
        cashHousingAllowanceMonthly: 5_000,
      }),
    );

    expect(result.taxes.socialContributions).toBe(29_250);
    expect(result.netSalary).toBe(330_750);
    expect(result.breakdown).toMatchObject({
      gosiBasicWageMonthly: 20_000,
      housingAllowanceType: "cash",
      cashHousingAllowanceMonthly: 5_000,
      gosiHousingValueMonthly: 5_000,
      gosiContributoryWageMonthly: 25_000,
    });
  });

  it("values in-kind housing at two months of basic wage per year for GOSI", () => {
    const result = SACalculator.calculate(
      inputs(360_000, {
        workerType: "saudi_standard" satisfies SAWorkerType,
        gosiBasicWageMonthly: 18_000,
        housingAllowanceType: "inKind",
      }),
    );

    expect(result.taxes.socialContributions).toBe(24_570);
    expect(result.breakdown).toMatchObject({
      gosiHousingValueMonthly: 3_000,
      gosiContributoryWageMonthly: 21_000,
    });
  });
});
