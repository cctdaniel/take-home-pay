// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { NOCalculator } from "./calculator";

describe("NO calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = NOCalculator.getDefaultInputs();
    const result = NOCalculator.calculate(inputs);
    expect(result.country).toBe("NO");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = NOCalculator.calculate({
      ...NOCalculator.getDefaultInputs(),
      grossSalary: NOCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = NOCalculator.calculate({
      ...NOCalculator.getDefaultInputs(),
      grossSalary: NOCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

