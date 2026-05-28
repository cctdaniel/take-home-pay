// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { AUCalculator } from "./calculator";

describe("AU calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = AUCalculator.getDefaultInputs();
    const result = AUCalculator.calculate(inputs);
    expect(result.country).toBe("AU");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = AUCalculator.calculate({
      ...AUCalculator.getDefaultInputs(),
      grossSalary: AUCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = AUCalculator.calculate({
      ...AUCalculator.getDefaultInputs(),
      grossSalary: AUCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

