// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { JPCalculator } from "./calculator";

describe("JP calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = JPCalculator.getDefaultInputs();
    const result = JPCalculator.calculate(inputs);
    expect(result.country).toBe("JP");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = JPCalculator.calculate({
      ...JPCalculator.getDefaultInputs(),
      grossSalary: JPCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = JPCalculator.calculate({
      ...JPCalculator.getDefaultInputs(),
      grossSalary: JPCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

