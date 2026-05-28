// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { SECalculator } from "./calculator";

describe("SE calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = SECalculator.getDefaultInputs();
    const result = SECalculator.calculate(inputs);
    expect(result.country).toBe("SE");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = SECalculator.calculate({
      ...SECalculator.getDefaultInputs(),
      grossSalary: SECalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = SECalculator.calculate({
      ...SECalculator.getDefaultInputs(),
      grossSalary: SECalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

