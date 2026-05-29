// Golden numbers cross-checked against VID PIT rates and SSIA contribution cap.
// Source: https://www.vid.gov.lv/en/personal-income-tax
import { describe, expect, it } from "vitest";
import { LVCalculator } from "./calculator";

describe("LV calculator", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = LVCalculator.getDefaultInputs();
    const result = LVCalculator.calculate(inputs);
    expect(result.country).toBe("LV");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies SS, NTA, and 25.5% PIT on EUR 36,000 gross", () => {
    const result = LVCalculator.calculate({
      ...LVCalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });
    if (result.breakdown.type === "LV") {
      expect(result.breakdown.socialSecurity.employee).toBe(3780);
      expect(result.breakdown.nonTaxableMinimum).toBe(6600);
      expect(result.breakdown.taxableIncome).toBe(25620);
    }
    expect(result.netSalary).toBe(25686.9);
  });

  it("applies 33% PIT above EUR 105,300 taxable on EUR 150,000 gross", () => {
    const result = LVCalculator.calculate({
      ...LVCalculator.getDefaultInputs(),
      grossSalary: 150_000,
    });
    if (result.breakdown.type === "LV") {
      expect(result.breakdown.socialSecurity.employee).toBe(11056.5);
      expect(result.breakdown.taxableIncome).toBe(132343.5);
    }
    expect(result.netSalary).toBe(103167.64);
  });
});
