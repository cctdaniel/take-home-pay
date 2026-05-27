import { describe, expect, it } from "vitest";
import { HRCalculator } from "./calculator";
import type { HRBreakdown, HRCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<HRCalculatorInputs> = {},
): HRCalculatorInputs {
  return {
    country: "HR",
    grossSalary,
    payFrequency: "annual",
    workScenario: "croatian_payroll",
    residencyType: "resident",
    locality: "zagreb",
    pensionScheme: "pillar_1_and_2",
    age: 35,
    croatianReturneeRelief: false,
    hasDependentSpouse: false,
    numberOfOtherDependents: 0,
    numberOfChildren: 0,
    numberOfDisabilityAllowances: 0,
    numberOfSevereDisabilityAllowances: 0,
    taxableBenefitsInKind: 0,
    contributions: {},
    ...overrides,
  };
}

function calculateHR(input: HRCalculatorInputs) {
  return HRCalculator.calculate(input);
}

describe("Croatia calculator", () => {
  it("applies Zagreb payroll tax after employee pension and basic allowance", () => {
    const result = calculateHR(inputs(30_000));
    const breakdown = result.breakdown as HRBreakdown;

    expect(breakdown.pension.total).toBe(6_000);
    expect(breakdown.personalAllowance.total).toBe(7_200);
    expect(result.taxableIncome).toBe(16_800);
    expect(result.taxes.incomeTax).toBe(3_864);
    expect(result.totalTax).toBe(9_864);
    expect(result.netSalary).toBe(20_136);
    expect(breakdown.employerContributions.healthInsurance).toBe(4_950);
  });

  it("adds resident spouse, child, and disability allowance factors", () => {
    const result = calculateHR(
      inputs(30_000, {
        hasDependentSpouse: true,
        numberOfChildren: 2,
        numberOfDisabilityAllowances: 1,
      }),
    );
    const allowance = (result.breakdown as HRBreakdown).personalAllowance;

    expect(allowance.dependentSpouse).toBe(3_600);
    expect(allowance.children).toBe(8_640);
    expect(allowance.disability).toBe(2_160);
    expect(allowance.total).toBe(21_600);
    expect(result.taxableIncome).toBe(2_400);
    expect(result.taxes.incomeTax).toBe(552);
    expect(result.netSalary).toBe(23_448);
  });

  it("applies youth relief against lower-bracket employment income tax", () => {
    const age25 = calculateHR(inputs(30_000, { age: 25 }));
    const age28 = calculateHR(inputs(30_000, { age: 28 }));

    expect(age25.taxes.incomeTax).toBe(0);
    expect(age25.totalTax).toBe(6_000);
    expect(age25.netSalary).toBe(24_000);
    expect(age28.taxes.incomeTax).toBe(1_932);
    expect(age28.totalTax).toBe(7_932);
    expect(age28.netSalary).toBe(22_068);
  });

  it("applies the Croatian returnee income-tax relief for eligible residents", () => {
    const result = calculateHR(
      inputs(30_000, { croatianReturneeRelief: true }),
    );
    const reliefs = (result.breakdown as HRBreakdown).taxReliefs;

    expect(reliefs.returneeRelief).toBe(3_864);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(6_000);
    expect(result.netSalary).toBe(24_000);
  });

  it("keeps taxable benefits in kind out of cash gross but in tax and pension bases", () => {
    const result = calculateHR(inputs(30_000, { taxableBenefitsInKind: 5_000 }));
    const breakdown = result.breakdown as HRBreakdown;

    expect(result.grossSalary).toBe(30_000);
    expect(breakdown.taxableGrossIncome).toBe(35_000);
    expect(breakdown.pension.total).toBe(7_000);
    expect(result.taxableIncome).toBe(20_800);
    expect(result.taxes.incomeTax).toBe(4_784);
    expect(result.totalTax).toBe(11_784);
    expect(result.netSalary).toBe(18_216);
  });

  it("models qualifying digital-nomad foreign-employer work as outside Croatian payroll", () => {
    const result = calculateHR(
      inputs(30_000, {
        workScenario: "digital_nomad_foreign_employer",
        residencyType: "non_resident",
      }),
    );
    const breakdown = result.breakdown as HRBreakdown;

    expect(breakdown.isDigitalNomadForeignEmployer).toBe(true);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(30_000);
    expect(breakdown.pension.total).toBe(0);
  });
});
