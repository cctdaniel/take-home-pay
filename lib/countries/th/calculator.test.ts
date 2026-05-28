// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { THCalculator } from "./calculator";

describe("TH calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = THCalculator.getDefaultInputs();
    const result = THCalculator.calculate(inputs);
    expect(result.country).toBe("TH");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = THCalculator.calculate({
      ...THCalculator.getDefaultInputs(),
      grossSalary: THCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = THCalculator.calculate({
      ...THCalculator.getDefaultInputs(),
      grossSalary: THCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

