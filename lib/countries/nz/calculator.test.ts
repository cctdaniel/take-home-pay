// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { NZCalculator } from "./calculator";

describe("NZ calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = NZCalculator.getDefaultInputs();
    const result = NZCalculator.calculate(inputs);
    expect(result.country).toBe("NZ");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = NZCalculator.calculate({
      ...NZCalculator.getDefaultInputs(),
      grossSalary: NZCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = NZCalculator.calculate({
      ...NZCalculator.getDefaultInputs(),
      grossSalary: NZCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

