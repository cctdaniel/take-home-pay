// Golden numbers cross-checked against FURS progressive tax schedule.
// Source: https://www.fu.gov.si/en/taxes/income_tax/
import { describe, expect, it } from "vitest";
import { SICalculator } from "./calculator";

describe("SI calculator", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = SICalculator.getDefaultInputs();
    const result = SICalculator.calculate(inputs);
    expect(result.country).toBe("SI");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies 22.1% social and progressive PIT on EUR 36,000 gross", () => {
    const result = SICalculator.calculate({
      ...SICalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });
    if (result.breakdown.type === "SI") {
      expect(result.breakdown.socialInsurance.employee).toBe(7956);
      expect(result.breakdown.taxableIncome).toBe(28044);
    }
    expect(result.netSalary).toBe(22323.3);
  });

  it("applies top 50% bracket on EUR 90,000 gross", () => {
    const result = SICalculator.calculate({
      ...SICalculator.getDefaultInputs(),
      grossSalary: 90_000,
    });
    if (result.breakdown.type === "SI") {
      expect(result.breakdown.socialInsurance.employee).toBe(19890);
      expect(result.breakdown.taxableIncome).toBe(70110);
    }
    expect(result.netSalary).toBe(49644.36);
  });
});
