import { describe, expect, it } from "vitest";
import { SICalculator } from "./calculator";
import type { SIBreakdown, SICalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<SICalculatorInputs> = {},
): SICalculatorInputs {
  return {
    country: "SI",
    grossSalary,
    payFrequency: "annual",
    age: 30,
    isResidentYoungWorker: false,
    isFullyDisabled: false,
    numberOfDependentChildren: 0,
    numberOfSpecialCareChildren: 0,
    numberOfOtherDependents: 0,
    mealReimbursementWorkdays: 220,
    transportReimbursementAnnual: 0,
    holidayAllowance: 0,
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

describe("Slovenia calculator", () => {
  it("calculates 2026 resident PIT, employee contributions, compulsory health, and tax-exempt meal reimbursements", () => {
    const result = SICalculator.calculate(inputs(60_000));
    const breakdown = result.breakdown as SIBreakdown;

    expect(result.grossSalary).toBe(61_628);
    expect(result.taxableIncome).toBe(40_120.13);
    expect(result.taxes.incomeTax).toBe(10_266.03);
    expect(result.taxes.socialContributions).toBe(14_327.94);
    expect(result.totalTax).toBe(24_593.97);
    expect(result.netSalary).toBe(37_034.03);
    expect(breakdown.taxExemptReimbursements).toEqual(
      expect.objectContaining({
        meal: 1_628,
        total: 1_628,
      }),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2025-01-3538/pravilnik-o-dolocitvi-usklajenih-zneskov-olajsav-enacbe-za-dolocitev-olajsave-in-lestvice-za-odmero-dohodnine-za-leto-2026",
        "https://www.fu.gov.si/en/life_events_individuals/dependent_family_members",
      ]),
    );
  });

  it("applies dependent, disability, young-worker, reimbursement, and supplementary pension options", () => {
    const result = SICalculator.calculate(
      inputs(50_000, {
        age: 28,
        isResidentYoungWorker: true,
        isFullyDisabled: true,
        numberOfDependentChildren: 2,
        numberOfSpecialCareChildren: 1,
        numberOfOtherDependents: 1,
        mealReimbursementWorkdays: 250,
        transportReimbursementAnnual: 3_000,
        holidayAllowance: 2_000,
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as SIBreakdown;
    const limits = SICalculator.getContributionLimits(inputs(50_000));

    expect(limits.retirementContribution?.limit).toBe(2_922);
    expect(result.grossSalary).toBe(56_850);
    expect(breakdown.taxExemptReimbursements).toEqual({
      meal: 1_850,
      transport: 3_000,
      holidayAllowance: 2_000,
      total: 6_850,
    });
    expect(breakdown.deductions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dependent child allowance", amount: 19_545.03 }),
        expect.objectContaining({
          name: "Other dependent family-member allowance",
          amount: 2_995.83,
        }),
        expect.objectContaining({
          name: "100% disability personal allowance",
          amount: 20_196.38,
        }),
        expect.objectContaining({
          name: "Resident young-worker allowance",
          amount: 1_443.5,
        }),
      ]),
    );
    expect(breakdown.voluntaryContributions).toEqual([
      expect.objectContaining({
        key: "retirementContribution",
        amount: 2_922,
        limit: 2_922,
      }),
    ]);
    expect(result.taxableIncome).toBe(0);
    expect(result.totalDeductions).toBe(14_939.94);
    expect(result.netSalary).toBe(41_910.06);
  });
});
