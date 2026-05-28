// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { DECalculator } from "./calculator";

describe("DE calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = DECalculator.getDefaultInputs();
    const result = DECalculator.calculate(inputs);
    expect(result.country).toBe("DE");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = DECalculator.calculate({
      ...DECalculator.getDefaultInputs(),
      grossSalary: DECalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = DECalculator.calculate({
      ...DECalculator.getDefaultInputs(),
      grossSalary: DECalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

