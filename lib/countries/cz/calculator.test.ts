// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { CZCalculator } from "./calculator";

describe("CZ calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = CZCalculator.getDefaultInputs();
    const result = CZCalculator.calculate(inputs);
    expect(result.country).toBe("CZ");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = CZCalculator.calculate({
      ...CZCalculator.getDefaultInputs(),
      grossSalary: CZCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = CZCalculator.calculate({
      ...CZCalculator.getDefaultInputs(),
      grossSalary: CZCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

