// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { VNCalculator } from "./calculator";

describe("VN calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = VNCalculator.getDefaultInputs();
    const result = VNCalculator.calculate(inputs);
    expect(result.country).toBe("VN");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = VNCalculator.calculate({
      ...VNCalculator.getDefaultInputs(),
      grossSalary: VNCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = VNCalculator.calculate({
      ...VNCalculator.getDefaultInputs(),
      grossSalary: VNCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

