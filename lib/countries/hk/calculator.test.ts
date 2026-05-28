// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { HKCalculator } from "./calculator";

describe("HK calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = HKCalculator.getDefaultInputs();
    const result = HKCalculator.calculate(inputs);
    expect(result.country).toBe("HK");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = HKCalculator.calculate({
      ...HKCalculator.getDefaultInputs(),
      grossSalary: HKCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = HKCalculator.calculate({
      ...HKCalculator.getDefaultInputs(),
      grossSalary: HKCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

