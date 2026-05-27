import { describe, expect, it } from "vitest";
import { OMCalculator } from "./calculator";
import {
  OM_EXPAT_PROVIDENT_EMPLOYER_RATE,
  OM_OPTIONAL_SAVINGS_ANNUAL_CAP,
} from "./constants/tax-year-2026";
import type { OMBreakdown, OMCalculatorInputs } from "./types";

function inputs(overrides: Partial<OMCalculatorInputs> = {}): OMCalculatorInputs {
  const defaults = OMCalculator.getDefaultInputs() as OMCalculatorInputs;

  return {
    ...defaults,
    grossSalary: 36_000,
    payFrequency: "annual",
    ...overrides,
    contributions: {
      ...defaults.contributions,
      ...overrides.contributions,
    },
  };
}

describe("Oman calculator", () => {
  it("models the default expatriate salary with no 2026 PIT or employee social deduction", () => {
    const result = OMCalculator.calculate(inputs());
    const breakdown = result.breakdown as OMBreakdown;

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialContributions).toBe(0);
    expect(result.netSalary).toBe(36_000);
    expect(breakdown.expatProvidentSchemeApplied).toBe(false);
    expect(breakdown.expatProvidentEmployerContributionAnnual).toBe(0);
  });

  it("shows non-Omani provident scheme employer savings without reducing employee net pay", () => {
    const result = OMCalculator.calculate(
      inputs({
        expatProvidentSchemeApplied: true,
        expatProvidentBasicWageMonthly: 2_000,
      }),
    );
    const breakdown = result.breakdown as OMBreakdown;

    expect(result.netSalary).toBe(36_000);
    expect(breakdown.expatProvidentBasicWageMonthly).toBe(2_000);
    expect(breakdown.expatProvidentEmployerContributionAnnual).toBe(
      2_000 * 12 * OM_EXPAT_PROVIDENT_EMPLOYER_RATE,
    );
  });

  it("caps the non-Omani provident basic wage to monthly gross salary", () => {
    const result = OMCalculator.calculate(
      inputs({
        grossSalary: 24_000,
        expatProvidentSchemeApplied: true,
        expatProvidentBasicWageMonthly: 4_000,
      }),
    );
    const breakdown = result.breakdown as OMBreakdown;

    expect(breakdown.expatProvidentBasicWageMonthly).toBe(2_000);
    expect(breakdown.expatProvidentEmployerContributionAnnual).toBe(
      2_000 * 12 * OM_EXPAT_PROVIDENT_EMPLOYER_RATE,
    );
  });

  it("applies the Omani employee SPF cap and rates on the selected monthly insured wage", () => {
    const result = OMCalculator.calculate(
      inputs({
        grossSalary: 72_000,
        workerType: "omani",
        spfInsuredWageMonthly: 6_000,
      }),
    );
    const breakdown = result.breakdown as OMBreakdown;

    expect(breakdown.spfInsuredWageMonthly).toBe(3_000);
    expect(result.taxes.socialContributions).toBe(2_880);
    expect(result.netSalary).toBe(69_120);
  });

  it("uses a lower selected Omani SPF insured wage when entered", () => {
    const result = OMCalculator.calculate(
      inputs({
        workerType: "omani",
        spfInsuredWageMonthly: 2_000,
      }),
    );
    const breakdown = result.breakdown as OMBreakdown;

    expect(breakdown.spfInsuredWageMonthly).toBe(2_000);
    expect(result.taxes.socialContributions).toBe(1_920);
    expect(result.netSalary).toBe(34_080);
  });

  it("caps optional SPF savings deposits and treats them as cash savings without tax relief", () => {
    const result = OMCalculator.calculate(
      inputs({
        grossSalary: 90_000,
        workerType: "omani",
        contributions: {
          retirementContribution: 50_000,
          qualifyingExpenses: 0,
        },
      }),
    );
    const savings = (result.breakdown as OMBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "retirementContribution",
    );

    expect(
      OMCalculator.getContributionLimits(inputs()).retirementContribution?.limit,
    ).toBe(0);
    expect(
      OMCalculator.getContributionLimits(inputs({ workerType: "omani" }))
        .retirementContribution?.limit,
    ).toBe(OM_OPTIONAL_SAVINGS_ANNUAL_CAP);
    expect(savings?.amount).toBe(OM_OPTIONAL_SAVINGS_ANNUAL_CAP);
    expect(savings?.taxTreatment).toBe("none");
    expect(savings?.taxBenefit).toBe(0);
    expect(result.netSalary).toBe(90_000 - 2_880 - OM_OPTIONAL_SAVINGS_ANNUAL_CAP);
  });
});
