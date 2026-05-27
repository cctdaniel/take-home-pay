import { describe, expect, it } from "vitest";
import { BZCalculator } from "./calculator";
import {
  BZ_CHARITABLE_RELIEF_MINIMUM,
  BZ_EDUCATION_RELIEF_PER_CHILD,
  BZ_SSB_RETIRED_PERSON_EMPLOYER_WEEKLY,
  BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_ANNUAL,
  BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY,
} from "./constants/tax-year-2026";
import type { BZBreakdown, BZCalculatorInputs } from "./types";

function inputs(
  overrides: Partial<BZCalculatorInputs> = {},
): BZCalculatorInputs {
  const defaults = BZCalculator.getDefaultInputs() as BZCalculatorInputs;

  return {
    ...defaults,
    grossSalary: 60_000,
    payFrequency: "annual",
    ...overrides,
    contributions: {
      ...defaults.contributions,
      ...overrides.contributions,
    },
  };
}

describe("Belize calculator", () => {
  it("matches the current BTS salary calculator formula above BZD 32,000 before return reliefs", () => {
    const result = BZCalculator.calculate(inputs());
    const breakdown = result.breakdown as BZBreakdown;

    expect(result.taxes.incomeTax).toBe(10_000);
    expect(result.taxes.socialContributions).toBe(
      BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_ANNUAL,
    );
    expect(result.netSalary).toBe(48_783.2);
    expect(breakdown.ssbEmployeeWeeklyContribution).toBe(
      BZ_SOCIAL_SECURITY_MAX_EMPLOYEE_WEEKLY,
    );
  });

  it("applies the BTS 2025 net-salary-floor tax credit between BZD 29,000 and 32,000", () => {
    const result = BZCalculator.calculate(inputs({ grossSalary: 31_000 }));

    expect(result.taxes.incomeTax).toBe(2_000);
    expect(result.netSalary).toBe(27_783.2);
  });

  it("ignores charitable relief below the official BZD 250 minimum", () => {
    const result = BZCalculator.calculate(
      inputs({
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: BZ_CHARITABLE_RELIEF_MINIMUM - 1,
          educationExpenses: 0,
        },
      }),
    );

    expect(result.taxes.incomeTax).toBe(10_000);
  });

  it("caps charitable relief at one-sixth of chargeable income before charity", () => {
    const result = BZCalculator.calculate(
      inputs({
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: 10_000,
          educationExpenses: 0,
        },
      }),
    );
    const breakdown = result.breakdown as BZBreakdown;

    expect(
      breakdown.voluntaryContributions.find(
        (contribution) => contribution.key === "charitableDonations",
      )?.amount,
    ).toBe(6_666.67);
    expect(result.taxes.incomeTax).toBe(8_333.33);
    expect(result.netSalary).toBe(50_449.87);
  });

  it("models education relief at BZD 400 per eligible non-dependent child", () => {
    const result = BZCalculator.calculate(
      inputs({
        educationReliefChildren: 2,
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 0,
          charitableDonations: 0,
          educationExpenses: 2_000,
        },
      }),
    );
    const breakdown = result.breakdown as BZBreakdown;

    expect(breakdown.educationReliefChildren).toBe(2);
    expect(
      breakdown.voluntaryContributions.find(
        (contribution) => contribution.key === "educationExpenses",
      )?.amount,
    ).toBe(2 * BZ_EDUCATION_RELIEF_PER_CHILD);
    expect(result.taxes.incomeTax).toBe(9_800);
    expect(result.netSalary).toBe(48_983.2);
  });

  it("lets payroll use selected weekly SSB insurable earnings", () => {
    const result = BZCalculator.calculate(
      inputs({ ssbWeeklyInsurableEarnings: 100 }),
    );
    const breakdown = result.breakdown as BZBreakdown;

    expect(breakdown.ssbWeeklyInsurableEarnings).toBe(100);
    expect(breakdown.ssbEmployeeWeeklyContribution).toBe(1.69);
    expect(result.taxes.socialContributions).toBe(87.88);
    expect(result.netSalary).toBe(49_912.12);
  });

  it("shows retired-person SSB categories as employer-only context", () => {
    const result = BZCalculator.calculate(
      inputs({ socialSecurityStatus: "age65Plus" }),
    );
    const breakdown = result.breakdown as BZBreakdown;

    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(50_000);
    expect(breakdown.ssbEmployerOnlyAnnualContribution).toBe(
      BZ_SSB_RETIRED_PERSON_EMPLOYER_WEEKLY * 52,
    );
  });

  it("exposes contribution limits for charity and eligible-child education relief", () => {
    const limits = BZCalculator.getContributionLimits(
      inputs({ educationReliefChildren: 3 }),
    );

    expect(limits.charitableDonations?.limit).toBe(6_666.67);
    expect(limits.educationExpenses?.limit).toBe(
      3 * BZ_EDUCATION_RELIEF_PER_CHILD,
    );
  });
});
