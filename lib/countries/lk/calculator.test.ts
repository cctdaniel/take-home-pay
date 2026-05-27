import { describe, expect, it } from "vitest";
import { calculateLKSecondaryEmploymentRate } from "./constants/tax-year-2026";
import { LKCalculator } from "./calculator";
import type { LKBreakdown, LKCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<LKCalculatorInputs> = {},
): LKCalculatorInputs {
  return {
    country: "LK",
    grossSalary,
    payFrequency: "annual",
    employmentType: "primary",
    epfCovered: true,
    annualLumpSumPayments: 0,
    taxableNonCashBenefits: 0,
    taxableTerminalBenefits: 0,
    terminalBenefitTreatment: "approvedOrEtf",
    primaryMonthlyRemuneration: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      housingExpenses: 0,
    },
    ...overrides,
  };
}

function calculateLK(input: LKCalculatorInputs) {
  return LKCalculator.calculate(input);
}

describe("Sri Lanka calculator", () => {
  it("matches IRD Table 01 primary-employment monthly formula at LKR 250,000/month", () => {
    const result = calculateLK(inputs(3_000_000));
    const breakdown = result.breakdown as LKBreakdown;

    expect(result.taxes.incomeTax).toBe(96_000);
    expect(result.taxes.socialContributions).toBe(240_000);
    expect(result.netSalary).toBe(2_664_000);
    expect(breakdown.employerEpfContribution).toBe(360_000);
    expect(breakdown.employerEtfContribution).toBe(90_000);
    expect(breakdown.totalEmployerStatutoryContributions).toBe(450_000);
    expect(breakdown.estimatedEmployerSalaryCost).toBe(3_450_000);
  });

  it("matches IRD Table 07 secondary-employment examples for resident employees", () => {
    expect(
      calculateLKSecondaryEmploymentRate({
        primaryMonthlyRemuneration: 250_000,
        secondaryAnnualRemuneration: 1_200_000,
      }),
    ).toBe(0.24);
    expect(
      calculateLKSecondaryEmploymentRate({
        primaryMonthlyRemuneration: 170_000,
        secondaryAnnualRemuneration: 420_000,
      }),
    ).toBe(0.06);
  });

  it("matches the IRD Table 08 foreign-employer example final cumulative liability", () => {
    const result = calculateLK(
      inputs(23_916_000, {
        employmentType: "foreignEmployer",
        epfCovered: true,
      }),
    );

    expect(result.taxes.incomeTax).toBe(3_227_400);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(20_688_600);
    expect((result.breakdown as LKBreakdown).employerEpfContribution).toBe(0);
    expect((result.breakdown as LKBreakdown).employerEtfContribution).toBe(0);
  });

  it("matches IRD Table 03 approved terminal-benefit withholding above LKR 5,000,000", () => {
    const result = calculateLK(
      inputs(0, {
        epfCovered: false,
        taxableTerminalBenefits: 6_000_000,
        terminalBenefitTreatment: "approvedOrEtf",
      }),
    );

    expect(result.taxes.incomeTax).toBe(120_000);
    expect(result.netSalary).toBe(5_880_000);
  });

  it("matches IRD Table 03 other or unapproved terminal-benefit treatment", () => {
    const belowRelief = calculateLK(
      inputs(0, {
        epfCovered: false,
        taxableTerminalBenefits: 1_800_000,
        terminalBenefitTreatment: "otherOrUnapproved",
      }),
    );
    const aboveRelief = calculateLK(
      inputs(0, {
        epfCovered: false,
        taxableTerminalBenefits: 2_000_000,
        terminalBenefitTreatment: "otherOrUnapproved",
      }),
    );

    expect(belowRelief.taxes.incomeTax).toBe(0);
    expect(belowRelief.netSalary).toBe(1_800_000);
    expect(aboveRelief.taxes.incomeTax).toBe(720_000);
    expect(aboveRelief.netSalary).toBe(1_280_000);
  });

  it("caps Sri Lanka annual-return reliefs and keeps them tax-only", () => {
    const limits = LKCalculator.getContributionLimits(inputs(3_000_000));
    const result = calculateLK(
      inputs(3_000_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 2_000_000,
          charitableDonations: 100_000,
          housingExpenses: 1_000_000,
        },
      }),
    );
    const breakdown = result.breakdown as LKBreakdown;
    const appliedReliefs = Object.fromEntries(
      breakdown.voluntaryContributions.map((contribution) => [
        contribution.key,
        contribution.amount,
      ]),
    );

    expect(limits.housingExpenses?.limit).toBe(600_000);
    expect(limits.charitableDonations?.limit).toBe(75_000);
    expect(limits.qualifyingExpenses?.limit).toBe(1_200_000);
    expect(appliedReliefs.housingExpenses).toBe(600_000);
    expect(appliedReliefs.charitableDonations).toBe(75_000);
    expect(appliedReliefs.qualifyingExpenses).toBe(525_000);
    expect(result.taxableIncome).toBe(0);
    expect(result.netSalary).toBe(2_760_000);
  });

  it("removes annual-return relief limits when the selected table is secondary employment", () => {
    const limits = LKCalculator.getContributionLimits(
      inputs(3_000_000, { employmentType: "secondary" }),
    );

    expect(limits.housingExpenses?.limit).toBe(0);
    expect(limits.charitableDonations?.limit).toBe(0);
    expect(limits.qualifyingExpenses?.limit).toBe(0);
  });

  it("removes annual-return relief limits for non-resident non-citizen employment", () => {
    const limits = LKCalculator.getContributionLimits(
      inputs(3_000_000, { employmentType: "nonResidentNonCitizen" }),
    );

    expect(limits.housingExpenses?.limit).toBe(0);
    expect(limits.charitableDonations?.limit).toBe(0);
    expect(limits.qualifyingExpenses?.limit).toBe(0);
  });
});
