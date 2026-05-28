// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { INCalculator } from "./calculator";

describe("IN calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = INCalculator.getDefaultInputs();
    const result = INCalculator.calculate(inputs);
    expect(result.country).toBe("IN");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = INCalculator.calculate({
      ...INCalculator.getDefaultInputs(),
      grossSalary: INCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = INCalculator.calculate({
      ...INCalculator.getDefaultInputs(),
      grossSalary: INCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

