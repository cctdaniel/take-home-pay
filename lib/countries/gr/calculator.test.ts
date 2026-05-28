// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { GRCalculator } from "./calculator";

describe("GR calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = GRCalculator.getDefaultInputs();
    const result = GRCalculator.calculate(inputs);
    expect(result.country).toBe("GR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = GRCalculator.calculate({
      ...GRCalculator.getDefaultInputs(),
      grossSalary: GRCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = GRCalculator.calculate({
      ...GRCalculator.getDefaultInputs(),
      grossSalary: GRCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

