// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { ISCalculator } from "./calculator";

describe("IS calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = ISCalculator.getDefaultInputs();
    const result = ISCalculator.calculate(inputs);
    expect(result.country).toBe("IS");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = ISCalculator.calculate({
      ...ISCalculator.getDefaultInputs(),
      grossSalary: ISCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = ISCalculator.calculate({
      ...ISCalculator.getDefaultInputs(),
      grossSalary: ISCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

