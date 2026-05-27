import { describe, expect, it } from "vitest";
import { PYCalculator } from "./calculator";
import type { PYBreakdown, PYCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<PYCalculatorInputs> = {},
): PYCalculatorInputs {
  return {
    country: "PY",
    grossSalary,
    payFrequency: "annual",
    ipsCovered: true,
    aguinaldoMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

function calculatePY(input: PYCalculatorInputs) {
  return PYCalculator.calculate(input);
}

describe("Paraguay calculator", () => {
  it("splits included statutory aguinaldo out of IRP and IPS salary", () => {
    const result = calculatePY(inputs(240_000_000));
    const breakdown = result.breakdown as PYBreakdown;

    expect(result.grossSalary).toBe(240_000_000);
    expect(breakdown.ordinarySalary).toBe(221_538_461.54);
    expect(breakdown.aguinaldo).toBe(18_461_538.46);
    expect(breakdown.taxableAndIpsSalaryBase).toBe(221_538_461.54);
    expect(result.taxes.socialContributions).toBe(19_938_461.54);
    expect(result.taxableIncome).toBe(201_600_000);
    expect(result.taxes.incomeTax).toBe(18_160_000);
    expect(result.totalTax).toBe(38_098_461.54);
    expect(result.netSalary).toBe(201_901_538.46);
  });

  it("caps documented deductible expenses at modeled income after IPS", () => {
    const limits = PYCalculator.getContributionLimits(inputs(240_000_000));
    const result = calculatePY(
      inputs(240_000_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 50_000_000,
        },
      }),
    );
    const deduction = (result.breakdown as PYBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "qualifyingExpenses",
    );

    expect(limits.qualifyingExpenses?.limit).toBe(201_600_000);
    expect(deduction?.amount).toBe(50_000_000);
    expect(result.taxableIncome).toBe(151_600_000);
    expect(result.taxes.incomeTax).toBe(13_160_000);
    expect(result.totalTax).toBe(33_098_461.54);
    expect(result.netSalary).toBe(206_901_538.46);
  });

  it("adds statutory aguinaldo on top of entered ordinary salary when selected", () => {
    const result = calculatePY(
      inputs(240_000_000, { aguinaldoMode: "additionalToGross" }),
    );
    const breakdown = result.breakdown as PYBreakdown;

    expect(result.grossSalary).toBe(260_000_000);
    expect(breakdown.ordinarySalary).toBe(240_000_000);
    expect(breakdown.aguinaldo).toBe(20_000_000);
    expect(result.taxes.socialContributions).toBe(21_600_000);
    expect(result.taxableIncome).toBe(218_400_000);
    expect(result.taxes.incomeTax).toBe(19_840_000);
    expect(result.totalTax).toBe(41_440_000);
    expect(result.netSalary).toBe(218_560_000);
  });

  it("removes IPS when coverage is not selected but keeps IRP on ordinary salary", () => {
    const result = calculatePY(
      inputs(240_000_000, {
        aguinaldoMode: "additionalToGross",
        ipsCovered: false,
      }),
    );

    expect(result.grossSalary).toBe(260_000_000);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.taxableIncome).toBe(240_000_000);
    expect(result.taxes.incomeTax).toBe(22_000_000);
    expect(result.netSalary).toBe(238_000_000);
  });

  it("does not apply IRP before the DNIT gross-income threshold is exceeded", () => {
    const result = calculatePY(inputs(78_000_000));

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(6_480_000);
    expect(result.taxableIncome).toBe(65_520_000);
    expect(result.netSalary).toBe(71_520_000);
    expect(
      PYCalculator.getContributionLimits(inputs(78_000_000)).qualifyingExpenses
        ?.limit,
    ).toBe(0);
  });
});
