import { describe, expect, it } from "vitest";
import { PECalculator } from "./calculator";
import type { PEBreakdown, PECalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<PECalculatorInputs> = {},
): PECalculatorInputs {
  return {
    country: "PE",
    grossSalary,
    payFrequency: "annual",
    salaryPackageMode: "includedInGross",
    gratificationHealthCoverage: "essalud",
    pensionSystem: "onp",
    afpCommissionMode: "flow",
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

describe("Peru calculator", () => {
  it("backs out private-sector gratifications from gross and applies ONP without reducing fifth-category tax", () => {
    const result = PECalculator.calculate(inputs(180_000));
    const breakdown = result.breakdown as PEBreakdown;

    expect(result.grossSalary).toBe(180_000);
    expect(breakdown.regularRemuneration).toBe(152_327.22);
    expect(breakdown.statutoryGratifications).toBe(25_387.87);
    expect(breakdown.extraordinaryGratificationBonus).toBe(2_284.91);
    expect(breakdown.pensionableRemuneration).toBe(152_327.22);
    expect(result.taxableIncome).toBe(141_500);
    expect(result.taxes.incomeTax).toBe(19_105);
    expect(result.taxes.socialContributions).toBe(19_802.54);
    expect(result.totalTax).toBe(38_907.54);
    expect(result.netSalary).toBe(141_092.46);
  });

  it("caps the additional deductible expenses at 3 UIT as a tax-only annual-return deduction", () => {
    const limits = PECalculator.getContributionLimits(inputs(180_000));
    const result = PECalculator.calculate(
      inputs(180_000, {
        contributions: {
          retirementContribution: 0,
          qualifyingExpenses: 20_000,
        },
      }),
    );
    const deduction = (result.breakdown as PEBreakdown).voluntaryContributions.find(
      (contribution) => contribution.key === "qualifyingExpenses",
    );

    expect(limits.qualifyingExpenses?.limit).toBe(16_500);
    expect(deduction?.amount).toBe(16_500);
    expect(result.taxableIncome).toBe(125_000);
    expect(result.taxes.incomeTax).toBe(16_300);
    expect(result.totalTax).toBe(36_102.54);
    expect(result.netSalary).toBe(143_897.46);
  });

  it("adds statutory gratifications on top of entered regular salary when selected", () => {
    const result = PECalculator.calculate(
      inputs(180_000, { salaryPackageMode: "additionalToGross" }),
    );
    const breakdown = result.breakdown as PEBreakdown;

    expect(result.grossSalary).toBe(212_700);
    expect(breakdown.regularRemuneration).toBe(180_000);
    expect(breakdown.statutoryGratifications).toBe(30_000);
    expect(breakdown.extraordinaryGratificationBonus).toBe(2_700);
    expect(result.taxableIncome).toBe(174_200);
    expect(result.taxes.incomeTax).toBe(24_664);
    expect(result.taxes.socialContributions).toBe(23_400);
    expect(result.totalTax).toBe(48_064);
    expect(result.netSalary).toBe(164_636);
  });

  it("models AFP flow commission as a payroll deduction for the selected AFP", () => {
    const result = PECalculator.calculate(
      inputs(180_000, {
        pensionSystem: "afpPrima",
        afpCommissionMode: "flow",
      }),
    );
    const breakdown = result.breakdown as PEBreakdown;

    expect(breakdown.pensionSystemName).toBe("AFP Prima");
    expect(breakdown.afpInsuranceBase).toBe(151_186.92);
    expect(result.taxes.socialContributions).toBe(19_741.22);
    expect(result.totalTax).toBe(38_846.22);
    expect(result.netSalary).toBe(141_153.78);
  });

  it("excludes AFP balance commission from take-home payroll deductions", () => {
    const result = PECalculator.calculate(
      inputs(180_000, {
        pensionSystem: "afpPrima",
        afpCommissionMode: "balance",
      }),
    );
    const breakdown = result.breakdown as PEBreakdown;

    expect(breakdown.afpBalanceCommissionRate).toBe(0.0125);
    expect(result.taxes.socialContributions).toBe(17_303.98);
    expect(result.totalTax).toBe(36_408.98);
    expect(result.netSalary).toBe(143_591.02);
  });
});
