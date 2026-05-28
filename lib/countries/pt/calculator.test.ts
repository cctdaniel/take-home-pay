// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { PTCalculator } from "./calculator";

describe("PT calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = PTCalculator.getDefaultInputs();
    const result = PTCalculator.calculate(inputs);
    expect(result.country).toBe("PT");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = PTCalculator.calculate({
      ...PTCalculator.getDefaultInputs(),
      grossSalary: PTCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = PTCalculator.calculate({
      ...PTCalculator.getDefaultInputs(),
      grossSalary: PTCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

