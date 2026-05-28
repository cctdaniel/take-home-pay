// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { ESCalculator } from "./calculator";

describe("ES calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = ESCalculator.getDefaultInputs();
    const result = ESCalculator.calculate(inputs);
    expect(result.country).toBe("ES");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = ESCalculator.calculate({
      ...ESCalculator.getDefaultInputs(),
      grossSalary: ESCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = ESCalculator.calculate({
      ...ESCalculator.getDefaultInputs(),
      grossSalary: ESCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

