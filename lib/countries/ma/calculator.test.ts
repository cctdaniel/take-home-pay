// Golden checks vs Moroccan General Tax Directorate IR tables
// https://www.tax.gov.ma/

import { describe, expect, it } from "vitest";
import { MACalculator } from "./calculator";

describe("MA calculator", () => {
  it("applies social, professional deduction, and IR at MAD 144,000 default", () => {
    const result = MACalculator.calculate(MACalculator.getDefaultInputs());
    expect(result.taxes.socialInsurance).toBeCloseTo(6_480, 0);
    expect(result.taxableIncome).toBeCloseTo(110_016, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(15_405.44, 0);
    expect(result.netSalary).toBeCloseTo(122_114.56, 0);
  });

  it("applies dependent credit on default salary with 2 dependents", () => {
    const result = MACalculator.calculate({
      ...MACalculator.getDefaultInputs(),
      dependents: 2,
    });
    expect(result.breakdown.dependentCredit).toBeCloseTo(1_200, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(14_205.44, 0);
    expect(result.netSalary).toBeCloseTo(123_314.56, 0);
  });

  it("has low tax on MAD 60,000 annual salary", () => {
    const result = MACalculator.calculate({
      ...MACalculator.getDefaultInputs(),
      grossSalary: 60_000,
    });
    expect(result.taxes.socialInsurance).toBeCloseTo(4_044, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(476.48, 0);
    expect(result.netSalary).toBeCloseTo(55_479.52, 0);
  });

  it("caps professional expense deduction on MAD 360,000 salary", () => {
    const result = MACalculator.calculate({
      ...MACalculator.getDefaultInputs(),
      grossSalary: 360_000,
    });
    expect(result.breakdown.professionalExpenseDeduction).toBe(30_000);
    expect(result.taxes.incomeTax).toBeCloseTo(90_496.21, 0);
    expect(result.netSalary).toBeCloseTo(258_142.19, 0);
  });

  it("returns zero tax on zero gross salary", () => {
    const result = MACalculator.calculate({
      ...MACalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialInsurance).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
