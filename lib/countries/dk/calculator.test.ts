import { describe, expect, it } from "vitest";
import { DKCalculator } from "./calculator";
import type { DKBreakdown, DKCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<DKCalculatorInputs> = {},
): DKCalculatorInputs {
  return {
    country: "DK",
    grossSalary,
    payFrequency: "annual",
    taxableBenefitsInKind: 0,
    taxRegime: "ordinary",
    statePensionProximity: "more_than_15_years",
    singleParentAllowanceEligible: false,
    roundTripCommutingKm: 0,
    commutingWorkdays: 216,
    contributions: {
      privateRatePension: 0,
      tradeUnionFees: 0,
      unemploymentInsuranceFees: 0,
      householdServices: 0,
      otherWorkExpenses: 0,
    },
    ...overrides,
    contributions: {
      privateRatePension: 0,
      tradeUnionFees: 0,
      unemploymentInsuranceFees: 0,
      householdServices: 0,
      otherWorkExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Denmark calculator", () => {
  it("calculates ordinary 2026 tax with AM-bidrag, personal allowance, employment allowance, and average municipal tax", () => {
    const result = DKCalculator.calculate(inputs(600_000));
    const breakdown = result.breakdown as DKBreakdown;

    expect(result.taxableIncome).toBe(431_500);
    expect(result.taxes.employeeSocialContribution).toBe(48_000);
    expect(result.taxes.incomeTax).toBe(167_884.23);
    expect(result.totalTax).toBe(215_884.23);
    expect(result.netSalary).toBe(384_115.77);
    expect(breakdown.personalAllowance).toBe(54_100);
    expect(breakdown.automaticAllowances).toEqual(
      expect.objectContaining({
        employmentAllowance: 63_300,
        jobAllowance: 3_100,
      }),
    );
    expect(breakdown.stateTaxes).toEqual(
      expect.objectContaining({
        bottomTax: 59_797.79,
        municipalTax: 108_086.44,
      }),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven",
        "https://skm.dk/tal-og-metode/satser/statistik-i-kommunerne/kommuneskatter-gennemsnitsprocenten-i-2026",
      ]),
    );
  });

  it("caps Danish voluntary deductions and handles taxable benefits, commuting, senior, and single-parent allowances", () => {
    const result = DKCalculator.calculate(
      inputs(900_000, {
        taxableBenefitsInKind: 50_000,
        statePensionProximity: "one_or_two_years",
        singleParentAllowanceEligible: true,
        roundTripCommutingKm: 150,
        commutingWorkdays: 220,
        contributions: {
          privateRatePension: 999_999,
          tradeUnionFees: 999_999,
          unemploymentInsuranceFees: 6_000,
          householdServices: 999_999,
          otherWorkExpenses: 20_000,
        },
      }),
    );
    const breakdown = result.breakdown as DKBreakdown;
    const limits = DKCalculator.getContributionLimits();

    expect(limits.privateRatePension?.limit).toBe(68_700);
    expect(limits.tradeUnionFees?.limit).toBe(7_000);
    expect(limits.householdServices?.limit).toBe(18_300);
    expect(breakdown.taxableBenefitsInKind).toBe(50_000);
    expect(breakdown.taxableGrossIncome).toBe(950_000);
    expect(breakdown.automaticAllowances).toEqual(
      expect.objectContaining({
        employmentAllowance: 63_300,
        jobAllowance: 3_100,
        singleParentEmploymentAllowance: 50_600,
        seniorEmploymentAllowance: 6_100,
      }),
    );
    expect(breakdown.voluntaryDeductions).toEqual(
      expect.objectContaining({
        privateRatePension: 68_700,
        extraPensionDeduction: 21_984,
        tradeUnionFees: 7_000,
        unemploymentInsuranceFees: 6_000,
        commutingDeduction: 55_677.6,
        householdServices: 18_300,
        otherWorkExpensesDeduction: 12_400,
      }),
    );
    expect(result.taxableIncome).toBe(506_738.4);
    expect(result.totalDeductions).toBe(376_214.52);
    expect(result.netSalary).toBe(523_785.48);
  });

  it("uses the researcher scheme as gross taxation without ordinary deductions", () => {
    const result = DKCalculator.calculate(
      inputs(900_000, {
        taxableBenefitsInKind: 50_000,
        taxRegime: "researcherScheme",
        contributions: {
          privateRatePension: 999_999,
          tradeUnionFees: 999_999,
          unemploymentInsuranceFees: 6_000,
          householdServices: 999_999,
          otherWorkExpenses: 20_000,
        },
      }),
    );
    const breakdown = result.breakdown as DKBreakdown;

    expect(result.taxableIncome).toBe(950_000);
    expect(result.taxes.employeeSocialContribution).toBe(76_000);
    expect(result.taxes.incomeTax).toBe(235_980);
    expect(result.totalTax).toBe(311_980);
    expect(result.totalDeductions).toBe(311_980);
    expect(result.netSalary).toBe(588_020);
    expect(breakdown.taxRegime).toBe("researcherScheme");
    expect(breakdown.personalAllowance).toBe(0);
    expect(breakdown.specialRegime).toEqual(
      expect.objectContaining({
        name: "Researcher / highly paid employee scheme",
        rate: 0.3284,
        incomeTax: 235_980,
        employeeSocialContribution: 76_000,
      }),
    );
    expect(Object.values(breakdown.voluntaryDeductions).every((amount) => amount === 0)).toBe(
      true,
    );
  });
});
