// Golden checks vs Costa Rica Decree 45333-H monthly salary tariff (2026).
// https://www.hacienda.go.cr/

import { describe, expect, it } from "vitest";
import { CRCalculator } from "./calculator";
import { CR_CCSS_EMPLOYEE_RATE } from "./constants/tax-year-2026";

describe("CR calculator", () => {
  it("has no IIT and withholds CCSS at default gross (₡687k/month)", () => {
    const gross = 8_244_000;
    const result = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.ccssEmployee).toBeCloseTo(gross * CR_CCSS_EMPLOYEE_RATE, 0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBeCloseTo(7_351_174.8, 0);
  });

  it("applies 10% bracket on monthly income above ₡918,000", () => {
    const gross = 12_000_000;
    const result = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.incomeTax).toBe(98_400);
    expect(result.taxes.ccssEmployee).toBeCloseTo(1_299_600, 0);
    expect(result.netSalary).toBeCloseTo(10_602_000, 0);
  });

  it("applies progressive monthly tax on high salary", () => {
    const gross = 60_000_000;
    const result = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.incomeTax).toBe(8_835_600);
    expect(result.taxes.ccssEmployee).toBeCloseTo(6_498_000, 0);
    expect(result.netSalary).toBeCloseTo(44_666_400, 0);
  });

  it("reduces tax with child and spouse monthly credits", () => {
    const gross = 18_000_000;
    const withoutCredits = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: gross,
    });
    const withCredits = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: gross,
      dependentChildren: 2,
      spouseCredit: 1,
    });

    expect(withCredits.taxes.incomeTax).toBe(718_080);
    expect(withoutCredits.taxes.incomeTax).toBe(790_200);
    expect(withCredits.netSalary).toBeGreaterThan(withoutCredits.netSalary);
  });

  it("clamps dependent children and spouse credit inputs", () => {
    const result = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: 18_000_000,
      dependentChildren: 99,
      spouseCredit: 5,
    });

    if (result.breakdown.type === "CR") {
      expect(result.breakdown.dependentChildren).toBe(10);
      expect(result.breakdown.spouseCredit).toBe(1);
    }
  });

  it("returns zero deductions for zero gross", () => {
    const result = CRCalculator.calculate({
      ...CRCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
