// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { SGCalculator } from "./calculator";

describe("SG calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = SGCalculator.getDefaultInputs();
    const result = SGCalculator.calculate(inputs);
    expect(result.country).toBe("SG");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = SGCalculator.calculate({
      ...SGCalculator.getDefaultInputs(),
      grossSalary: SGCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = SGCalculator.calculate({
      ...SGCalculator.getDefaultInputs(),
      grossSalary: SGCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

