import { describe, expect, it } from "vitest";
import { calculateNO, NOCalculator } from "./calculator";
import {
  NO_CHILDCARE_DEDUCTION_2026,
  NO_COMMUTING_DEDUCTION_2026,
  NO_IPS_DEDUCTION_LIMIT,
  NO_TAX_CONFIG,
  NO_UNION_DUES_DEDUCTION_LIMIT,
} from "./constants/tax-year-2026";
import type { NOCalculatorInputs } from "./types";

type NOOverrides = Omit<Partial<NOCalculatorInputs>, "contributions"> & {
  contributions?: Partial<NOCalculatorInputs["contributions"]>;
};

function inputs(overrides: NOOverrides = {}): NOCalculatorInputs {
  return {
    country: "NO",
    grossSalary: NO_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    taxScheme: "ordinary",
    payeNationalInsurance: "included",
    childcareDeductionMode: "ordinary",
    childcareChildren: 0,
    roundTripCommutingKm: 0,
    commutingWorkdays: 0,
    contributions: {
      ipsContribution: 0,
      tradeUnionFees: 0,
      childcareExpenses: 0,
      debtInterestPaid: 0,
    },
    ...overrides,
    contributions: {
      ipsContribution: 0,
      tradeUnionFees: 0,
      childcareExpenses: 0,
      debtInterestPaid: 0,
      ...overrides.contributions,
    },
  };
}

describe("Norway calculator", () => {
  it("exposes official ordinary deduction limits", () => {
    const limits = NOCalculator.getContributionLimits(
      inputs({
        childcareDeductionMode: "ordinary",
        childcareChildren: 2,
      }),
    );

    expect(limits.ipsContribution?.limit).toBe(NO_IPS_DEDUCTION_LIMIT);
    expect(limits.tradeUnionFees?.limit).toBe(NO_UNION_DUES_DEDUCTION_LIMIT);
    expect(limits.childcareExpenses?.limit).toBe(
      NO_CHILDCARE_DEDUCTION_2026.ordinaryFirstChild +
        NO_CHILDCARE_DEDUCTION_2026.ordinaryAdditionalChild,
    );

    const specialNeedsLimits = NOCalculator.getContributionLimits(
      inputs({
        childcareDeductionMode: "specialNeeds",
        childcareChildren: 2,
      }),
    );
    expect(specialNeedsLimits.childcareExpenses?.limit).toBe(
      NO_CHILDCARE_DEDUCTION_2026.specialNeedsFirstChild +
        NO_CHILDCARE_DEDUCTION_2026.specialNeedsAdditionalChild,
    );
  });

  it("applies ordinary deductions to ordinary income but not National Insurance", () => {
    const base = calculateNO(inputs());
    const baseBreakdown = base.breakdown;
    const result = calculateNO(
      inputs({
        childcareChildren: 2,
        roundTripCommutingKm: 100,
        commutingWorkdays: 220,
        contributions: {
          ipsContribution: 50_000,
          tradeUnionFees: 20_000,
          childcareExpenses: 30_000,
          debtInterestPaid: 10_000,
        },
      }),
    );
    const breakdown = result.breakdown;

    expect(baseBreakdown.type).toBe("NO");
    expect(breakdown.type).toBe("NO");
    if (baseBreakdown.type !== "NO" || breakdown.type !== "NO") {
      return;
    }

    const commutingDeduction =
      100 * 220 * NO_COMMUTING_DEDUCTION_2026.ratePerKm -
      NO_COMMUTING_DEDUCTION_2026.lowerThreshold;

    expect(breakdown.voluntaryContributions.ipsDeductionApplied).toBe(25_000);
    expect(breakdown.voluntaryContributions.tradeUnionFees).toBe(8_700);
    expect(breakdown.voluntaryContributions.childcareDeductionApplied).toBe(
      25_000,
    );
    expect(breakdown.voluntaryContributions.commutingDeduction).toBe(
      commutingDeduction,
    );
    expect(breakdown.voluntaryContributions.debtInterestPaid).toBe(10_000);
    expect(result.taxableIncome).toBe(base.taxableIncome - 98_500);
    expect(result.totalTax).toBe(base.totalTax - 98_500 * 0.22);
    expect(breakdown.employeeSocialContribution.amount).toBe(
      baseBreakdown.employeeSocialContribution.amount,
    );
  });

  it("does not apply ordinary deductions when PAYE is applied", () => {
    const result = calculateNO(
      inputs({
        taxScheme: "paye",
        contributions: {
          ipsContribution: 25_000,
          tradeUnionFees: 8_700,
          childcareExpenses: 25_000,
          debtInterestPaid: 10_000,
        },
        childcareChildren: 2,
        roundTripCommutingKm: 100,
        commutingWorkdays: 220,
      }),
    );

    expect(result.breakdown.type).toBe("NO");
    if (result.breakdown.type !== "NO") {
      return;
    }

    expect(result.breakdown.paye.applied).toBe(true);
    expect(result.breakdown.voluntaryContributions.ipsContribution).toBe(0);
    expect(result.breakdown.voluntaryContributions.tradeUnionFees).toBe(0);
    expect(result.breakdown.voluntaryContributions.childcareDeductionApplied).toBe(
      0,
    );
    expect(result.breakdown.voluntaryContributions.commutingDeduction).toBe(0);
    expect(result.breakdown.voluntaryContributions.debtInterestPaid).toBe(0);
  });
});
