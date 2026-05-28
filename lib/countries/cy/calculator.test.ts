// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { CYCalculator } from "./calculator";

describe("CY calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = CYCalculator.getDefaultInputs();
    const result = CYCalculator.calculate(inputs);
    expect(result.country).toBe("CY");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = CYCalculator.calculate({
      ...CYCalculator.getDefaultInputs(),
      grossSalary: CYCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = CYCalculator.calculate({
      ...CYCalculator.getDefaultInputs(),
      grossSalary: CYCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

