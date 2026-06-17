// Golden numbers cross-checked against Ministry of Labour social cap and 10% PIT.
// Source: https://www.mi.government.bg/en/general/danaci-i-socialni-osigurovki-svarzani-sas-slujitelite/
import { describe, expect, it } from "vitest";
import {
  BG_PIT_RATE,
  BG_SOCIAL_ANNUAL_CAP,
  BG_SOCIAL_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import { BGCalculator } from "./calculator";

describe("BG calculator", () => {
  it("returns net below gross for default inputs", () => {
    const result = BGCalculator.calculate(BGCalculator.getDefaultInputs());
    expect(result.country).toBe("BG");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies 13.78% social and 10% PIT on EUR 36,000 gross", () => {
    const result = BGCalculator.calculate({
      ...BGCalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });
    const expectedSocial = Math.round(BG_SOCIAL_ANNUAL_CAP * BG_SOCIAL_EMPLOYEE_RATE * 100) / 100;
    const expectedTaxable = 36_000 - expectedSocial;
    const expectedPit = Math.round(expectedTaxable * BG_PIT_RATE * 100) / 100;

    if (result.breakdown.type === "BG") {
      expect(result.breakdown.socialSecurity.employee).toBe(expectedSocial);
      expect(result.breakdown.taxableIncome).toBe(expectedTaxable);
      expect(result.breakdown.incomeTax.total).toBe(expectedPit);
    }
    expect(result.netSalary).toBe(29_257.37);
  });

  it("applies uncapped social below the annual ceiling on EUR 24,000", () => {
    const result = BGCalculator.calculate({
      ...BGCalculator.getDefaultInputs(),
      grossSalary: 24_000,
    });
    if (result.breakdown.type === "BG") {
      expect(result.breakdown.socialSecurity.employee).toBe(3_307.2);
      expect(result.breakdown.taxableIncome).toBe(20_692.8);
      expect(result.breakdown.incomeTax.total).toBe(2_069.28);
    }
    expect(result.netSalary).toBe(18_623.52);
  });

  it("caps employee social at EUR 25,339.68 base on EUR 50,000 gross", () => {
    const result = BGCalculator.calculate({
      ...BGCalculator.getDefaultInputs(),
      grossSalary: 50_000,
    });
    if (result.breakdown.type === "BG") {
      expect(result.breakdown.socialSecurity.base).toBe(BG_SOCIAL_ANNUAL_CAP);
      expect(result.breakdown.socialSecurity.employee).toBe(3_491.81);
    }
    expect(result.netSalary).toBe(41_857.37);
  });

  it("returns zero tax on zero gross", () => {
    const result = BGCalculator.calculate({
      ...BGCalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
  });

  it("handles high salary above social cap", () => {
    const result = BGCalculator.calculate({
      ...BGCalculator.getDefaultInputs(),
      grossSalary: 100_000,
    });
    expect(result.netSalary).toBeGreaterThan(80_000);
    expect(result.netSalary).toBeLessThan(100_000);
  });
});
