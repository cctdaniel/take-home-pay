// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { MYCalculator } from "./calculator";

describe("MY calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = MYCalculator.getDefaultInputs();
    const result = MYCalculator.calculate(inputs);
    expect(result.country).toBe("MY");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = MYCalculator.calculate({
      ...MYCalculator.getDefaultInputs(),
      grossSalary: MYCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = MYCalculator.calculate({
      ...MYCalculator.getDefaultInputs(),
      grossSalary: MYCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

