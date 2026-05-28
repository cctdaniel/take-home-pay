// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { HRCalculator } from "./calculator";

describe("HR calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = HRCalculator.getDefaultInputs();
    const result = HRCalculator.calculate(inputs);
    expect(result.country).toBe("HR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = HRCalculator.calculate({
      ...HRCalculator.getDefaultInputs(),
      grossSalary: HRCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = HRCalculator.calculate({
      ...HRCalculator.getDefaultInputs(),
      grossSalary: HRCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

