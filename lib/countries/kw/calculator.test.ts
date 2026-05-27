import { describe, expect, it } from "vitest";
import { KWCalculator } from "./calculator";
import type { KWCalculatorInputs, KWSector, KWWorkerType } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<KWCalculatorInputs> = {},
): KWCalculatorInputs {
  return {
    country: "KW",
    grossSalary,
    payFrequency: "annual",
    workerType: "expatriate",
    sector: "government",
    pifssInsurableSalaryMonthly: 0,
    pifssBasicSalaryMonthly: 0,
    pifssSupplementarySalaryMonthly: 0,
    includeFinancialRemuneration: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

describe("Kuwait calculator", () => {
  it("models expatriate salary with no PIT or employee PIFSS deduction", () => {
    const result = KWCalculator.calculate(inputs(30_000));

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(30_000);
  });

  it("applies official PIFSS basic, supplementary, and pension-increase employee caps", () => {
    const result = KWCalculator.calculate(
      inputs(60_000, {
        workerType: "kuwaiti" satisfies KWWorkerType,
      }),
    );

    expect(result.taxes.socialContributions).toBe(2_475);
    expect(result.netSalary).toBe(57_525);
    expect(result.breakdown).toMatchObject({
      workerType: "kuwaiti",
      pifssInsurableSalaryMonthly: 2_750,
      pifssInsurableSalaryAnnual: 33_000,
      pifssBasicSalaryMonthly: 1_500,
      pifssSupplementarySalaryMonthly: 1_250,
      pifssPensionIncreaseSalaryMonthly: 2_750,
      includeFinancialRemuneration: false,
    });
  });

  it("adds private/oil unemployment and financial-remuneration contribution only when selected", () => {
    const result = KWCalculator.calculate(
      inputs(60_000, {
        workerType: "kuwaiti" satisfies KWWorkerType,
        sector: "privateOil" satisfies KWSector,
        includeFinancialRemuneration: true,
      }),
    );

    expect(result.taxes.socialContributions).toBe(3_090);
    expect(result.netSalary).toBe(56_910);
    expect(result.breakdown).toMatchObject({
      sector: "privateOil",
      includeFinancialRemuneration: true,
    });
  });

  it("uses entered basic and supplementary PIFSS salary bases separately", () => {
    const result = KWCalculator.calculate(
      inputs(24_000, {
        workerType: "kuwaiti" satisfies KWWorkerType,
        pifssBasicSalaryMonthly: 1_000,
        pifssSupplementarySalaryMonthly: 400,
      }),
    );

    expect(result.taxes.socialContributions).toBe(1_260);
    expect(result.netSalary).toBe(22_740);
    expect(result.breakdown).toMatchObject({
      pifssInsurableSalaryMonthly: 1_400,
      pifssBasicSalaryMonthly: 1_000,
      pifssSupplementarySalaryMonthly: 400,
      pifssPensionIncreaseSalaryMonthly: 1_400,
    });
  });
});
