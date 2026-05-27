import { describe, expect, it } from "vitest";
import { SCCalculator } from "./calculator";
import type {
  SCBreakdown,
  SCCalculatorInputs,
  SCEmployeeTaxTable,
  SCTaxBreakdown,
} from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<SCCalculatorInputs> = {},
): SCCalculatorInputs {
  return {
    country: "SC",
    grossSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "annual",
    employeeTaxTable: "non_citizen",
    citizenship: "non_citizen",
    taxableNonMonetaryBenefits: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
  };
}

function calculateSC(input: SCCalculatorInputs) {
  return SCCalculator.calculate(input);
}

describe("Seychelles calculator", () => {
  it.each([
    ["non_citizen", 18_000],
    ["citizen", 2_600.1],
    ["specific_project", 3_600],
    ["stevedore", 12_000],
  ] satisfies Array<[SCEmployeeTaxTable, number]>)(
    "calculates the SRC %s employee tax table",
    (employeeTaxTable, expectedIncomeTax) => {
      const result = calculateSC(
        inputs(120_000, {
          employeeTaxTable,
          citizenship: employeeTaxTable === "citizen" ? "citizen" : "non_citizen",
        }),
      );

      expect(result.taxes.incomeTax).toBe(expectedIncomeTax);
      expect(result.taxes.socialContributions).toBe(6_000);
    },
  );

  it("shows non-monetary benefits tax as an employer-only estimate", () => {
    const result = calculateSC(
      inputs(120_000, {
        taxableNonMonetaryBenefits: 10_000,
      }),
    );
    const breakdown = result.breakdown as SCBreakdown;
    const taxes = result.taxes as SCTaxBreakdown;

    expect(result.totalTax).toBe(24_000);
    expect(result.netSalary).toBe(96_000);
    expect(taxes.nonMonetaryBenefitsTax).toBe(1_500);
    expect(breakdown.nonMonetaryBenefitsTax).toBe(1_500);
  });

  it("models SPF voluntary salary deduction as cash-only retirement saving", () => {
    const limits = SCCalculator.getContributionLimits(inputs(120_000));
    const result = calculateSC(
      inputs(120_000, {
        contributions: {
          retirementContribution: 12_000,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as SCBreakdown;

    expect(limits.retirementContribution?.limit).toBe(96_000);
    expect(result.totalTax).toBe(24_000);
    expect(result.totalDeductions).toBe(36_000);
    expect(result.netSalary).toBe(84_000);
    expect(breakdown.voluntarySpfContribution).toBe(12_000);
    expect(breakdown.voluntaryContributions[0]).toMatchObject({
      key: "retirementContribution",
      amount: 12_000,
      taxTreatment: "none",
      taxBenefit: 0,
      cashFlowTreatment: "deductFromNet",
    });
  });

  it("caps SPF voluntary salary deduction to remaining after-tax cash pay", () => {
    const result = calculateSC(
      inputs(120_000, {
        contributions: {
          retirementContribution: 200_000,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as SCBreakdown;

    expect(breakdown.voluntarySpfContribution).toBe(96_000);
    expect(result.netSalary).toBe(0);
  });
});
