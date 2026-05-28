// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { MTCalculator } from "./calculator";

describe("MT calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = MTCalculator.getDefaultInputs();
    const result = MTCalculator.calculate(inputs);
    expect(result.country).toBe("MT");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = MTCalculator.calculate({
      ...MTCalculator.getDefaultInputs(),
      grossSalary: MTCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = MTCalculator.calculate({
      ...MTCalculator.getDefaultInputs(),
      grossSalary: MTCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

