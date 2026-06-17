// Golden numbers cross-checked against BPS contribution rates and IRPF BPC brackets.
// Source: https://www.bps.gub.uy/
import { describe, expect, it } from "vitest";
import { UY_MNIG_ANNUAL, UY_SOCIAL_EMPLOYEE_RATE } from "./constants/tax-year-2026";
import { UYCalculator } from "./calculator";

describe("UY calculator", () => {
  it("returns net below gross for default inputs", () => {
    const result = UYCalculator.calculate(UYCalculator.getDefaultInputs());
    expect(result.country).toBe("UY");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies 18.1% social and zero IRPF below MNIG on UYU 600,000 gross", () => {
    const result = UYCalculator.calculate({
      ...UYCalculator.getDefaultInputs(),
      grossSalary: 600_000,
    });
    if (result.breakdown.type === "UY") {
      expect(result.breakdown.socialSecurity.employee).toBe(108_600);
      expect(result.breakdown.mnigAnnual).toBe(UY_MNIG_ANNUAL);
      expect(result.breakdown.taxableIncome).toBe(491_400);
      expect(result.breakdown.incomeTax.total).toBe(0);
    }
    expect(result.netSalary).toBe(491_400);
  });

  it("applies 10% bracket above MNIG on UYU 800,000 gross", () => {
    const result = UYCalculator.calculate({
      ...UYCalculator.getDefaultInputs(),
      grossSalary: 800_000,
    });
    if (result.breakdown.type === "UY") {
      expect(result.breakdown.socialSecurity.employee).toBe(144_800);
      expect(result.breakdown.taxableIncome).toBe(655_200);
      expect(result.breakdown.incomeTax.total).toBe(7_862.4);
    }
    expect(result.netSalary).toBe(647_337.6);
  });

  it("applies multiple IRPF brackets on UYU 1,500,000 gross", () => {
    const result = UYCalculator.calculate({
      ...UYCalculator.getDefaultInputs(),
      grossSalary: 1_500_000,
    });
    if (result.breakdown.type === "UY") {
      expect(result.breakdown.socialSecurity.employee).toBe(271_500);
      expect(result.breakdown.taxableIncome).toBe(1_228_500);
      expect(result.breakdown.incomeTax.total).toBe(85_433.4);
    }
    expect(result.netSalary).toBe(1_143_066.6);
  });

  it("deducts employee social before IRPF base", () => {
    const gross = 700_000;
    const result = UYCalculator.calculate({
      ...UYCalculator.getDefaultInputs(),
      grossSalary: gross,
    });
    const expectedSocial = Math.round(gross * UY_SOCIAL_EMPLOYEE_RATE * 100) / 100;
    if (result.breakdown.type === "UY") {
      expect(result.breakdown.socialSecurity.employee).toBe(expectedSocial);
      expect(result.breakdown.taxableIncome).toBe(gross - expectedSocial);
    }
  });

  it("returns zero tax on zero gross", () => {
    const result = UYCalculator.calculate({
      ...UYCalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
  });
});
