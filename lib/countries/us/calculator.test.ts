// Golden tests — cross-check: IRS Pub 15-T / SmartAsset paycheck estimator
import { describe, expect, it } from "vitest";
import { calculateUS } from "./calculator";
import type { USCalculatorInputs } from "../types";

function usInput(
  grossSalary: number,
  overrides: Partial<USCalculatorInputs> = {},
): USCalculatorInputs {
  return {
    country: "US",
    grossSalary,
    state: "CA",
    filingStatus: "single",
    payFrequency: "annual",
    age: 30,
    numberOfQualifyingChildren: 0,
    numberOfOtherDependents: 0,
    contributions: {
      traditional401k: 0,
      roth401k: 0,
      rothIRA: 0,
      traditionalIRA: 0,
      hsa: 0,
      hsaCoverageType: "self",
      fsa: 0,
      dependentCareFSA: 0,
      commuterBenefits: 0,
      studentLoanInterest: 0,
    },
    ...overrides,
  };
}

describe("US calculator 2026", () => {
  it("net pay is below gross for median CA salary", () => {
    const result = calculateUS(usInput(100_000));
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.federalIncomeTax).toBeGreaterThan(0);
    expect(result.taxes.socialSecurity).toBeGreaterThan(0);
  });

  it("401(k) and HSA reduce federal taxable income", () => {
    const base = calculateUS(usInput(150_000));
    const withDeductions = calculateUS(
      usInput(150_000, {
        contributions: {
          ...usInput(150_000).contributions,
          traditional401k: 23_500,
          hsa: 4_400,
        },
      }),
    );
    expect(withDeductions.breakdown.taxableIncomeForFederal).toBeLessThan(
      base.breakdown.taxableIncomeForFederal,
    );
    expect(withDeductions.taxes.federalIncomeTax).toBeLessThan(
      base.taxes.federalIncomeTax,
    );
  });

  it("pre-tax 401(k) lowers take-home pay even when taxes fall", () => {
    const base = calculateUS(usInput(500_000));
    const max401k = calculateUS(
      usInput(500_000, {
        contributions: {
          ...usInput(500_000).contributions,
          traditional401k: 24_500,
        },
      }),
    );
    expect(max401k.taxes.federalIncomeTax).toBeLessThan(base.taxes.federalIncomeTax);
    expect(max401k.netSalary).toBeLessThan(base.netSalary);
    expect(max401k.netSalary).toBe(
      max401k.grossSalary - max401k.totalDeductions,
    );
  });

  it("student loan interest raises net pay via tax savings only", () => {
    const base = calculateUS(usInput(100_000));
    const withInterest = calculateUS(
      usInput(100_000, {
        contributions: {
          ...usInput(100_000).contributions,
          studentLoanInterest: 2_500,
        },
      }),
    );
    expect(withInterest.taxes.federalIncomeTax).toBeLessThan(
      base.taxes.federalIncomeTax,
    );
    expect(withInterest.netSalary).toBeGreaterThan(base.netSalary);
    expect(withInterest.netSalary).toBe(
      withInterest.grossSalary - withInterest.totalDeductions,
    );
  });

  it("traditional IRA deduction does not reduce modeled take-home pay", () => {
    const base = calculateUS(usInput(100_000));
    const withIra = calculateUS(
      usInput(100_000, {
        contributions: {
          ...usInput(100_000).contributions,
          traditionalIRA: 7_000,
        },
      }),
    );
    expect(withIra.taxes.federalIncomeTax).toBeLessThan(base.taxes.federalIncomeTax);
    expect(withIra.netSalary).toBeGreaterThan(base.netSalary);
  });

  it("child tax credit reduces federal income tax", () => {
    const noKids = calculateUS(usInput(120_000));
    const withKids = calculateUS(
      usInput(120_000, { numberOfQualifyingChildren: 2 }),
    );
    expect(withKids.taxes.federalIncomeTax).toBeLessThan(noKids.taxes.federalIncomeTax);
    expect(withKids.breakdown.taxCredits.totalCredits).toBe(4_000);
  });

  it("TX has no state income tax", () => {
    const result = calculateUS(usInput(250_000, { state: "TX" }));
    expect(result.taxes.stateIncomeTax).toBe(0);
  });

  it("clamps elective deferral between traditional and Roth 401(k)", () => {
    const result = calculateUS(
      usInput(200_000, {
        age: 30,
        contributions: {
          ...usInput(200_000).contributions,
          traditional401k: 20_000,
          roth401k: 10_000,
        },
      }),
    );
    expect(result.breakdown.contributions.traditional401k).toBe(20_000);
    expect(result.breakdown.contributions.roth401k).toBeLessThanOrEqual(4_500);
  });
});
