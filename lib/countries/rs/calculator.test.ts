// Golden numbers cross-checked against PURS social cap and 10% PIT rules.
// Source: https://www.purs.gov.rs/
import { describe, expect, it } from "vitest";
import {
  RS_NON_TAXABLE_ANNUAL,
  RS_SOCIAL_ANNUAL_CAP,
  RS_SOCIAL_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import { RSCalculator } from "./calculator";

describe("RS calculator", () => {
  it("returns net below gross for default inputs", () => {
    const result = RSCalculator.calculate(RSCalculator.getDefaultInputs());
    expect(result.country).toBe("RS");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies 19.9% social and 10% PIT on RSD 2,160,000 gross", () => {
    const result = RSCalculator.calculate({
      ...RSCalculator.getDefaultInputs(),
      grossSalary: 2_160_000,
    });
    if (result.breakdown.type === "RS") {
      expect(result.breakdown.socialSecurity.employee).toBe(429_840);
      expect(result.breakdown.nonTaxableAmount).toBe(RS_NON_TAXABLE_ANNUAL);
      expect(result.breakdown.taxableIncome).toBe(1_319_508);
      expect(result.breakdown.incomeTax.total).toBe(131_950.8);
    }
    expect(result.netSalary).toBe(1_598_209.2);
  });

  it("returns zero PIT when non-taxable amount exceeds remaining income", () => {
    const result = RSCalculator.calculate({
      ...RSCalculator.getDefaultInputs(),
      grossSalary: 500_000,
    });
    if (result.breakdown.type === "RS") {
      expect(result.breakdown.socialSecurity.employee).toBe(99_500);
      expect(result.breakdown.taxableIncome).toBe(0);
      expect(result.breakdown.incomeTax.total).toBe(0);
    }
    expect(result.netSalary).toBe(400_500);
  });

  it("caps employee social at RSD 8,793,840 annual base", () => {
    const result = RSCalculator.calculate({
      ...RSCalculator.getDefaultInputs(),
      grossSalary: 10_000_000,
    });
    if (result.breakdown.type === "RS") {
      expect(result.breakdown.socialSecurity.base).toBe(RS_SOCIAL_ANNUAL_CAP);
      expect(result.breakdown.socialSecurity.employee).toBe(
        Math.round(RS_SOCIAL_ANNUAL_CAP * RS_SOCIAL_EMPLOYEE_RATE * 100) / 100,
      );
    }
    expect(result.netSalary).toBeGreaterThan(7_000_000);
  });

  it("handles mid-range salary RSD 1,200,000", () => {
    const result = RSCalculator.calculate({
      ...RSCalculator.getDefaultInputs(),
      grossSalary: 1_200_000,
    });
    if (result.breakdown.type === "RS") {
      expect(result.breakdown.socialSecurity.employee).toBe(238_800);
      expect(result.breakdown.taxableIncome).toBe(550_548);
      expect(result.breakdown.incomeTax.total).toBe(55_054.8);
    }
    expect(result.netSalary).toBe(906_145.2);
  });

  it("returns zero tax on zero gross", () => {
    const result = RSCalculator.calculate({
      ...RSCalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
  });
});
