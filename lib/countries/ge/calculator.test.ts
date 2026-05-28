// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { GECalculator } from "./calculator";

describe("GE calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = GECalculator.getDefaultInputs();
    const result = GECalculator.calculate(inputs);
    expect(result.country).toBe("GE");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = GECalculator.calculate({
      ...GECalculator.getDefaultInputs(),
      grossSalary: GECalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = GECalculator.calculate({
      ...GECalculator.getDefaultInputs(),
      grossSalary: GECalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

