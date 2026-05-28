// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { UKCalculator } from "./calculator";

describe("UK calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = UKCalculator.getDefaultInputs();
    const result = UKCalculator.calculate(inputs);
    expect(result.country).toBe("UK");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = UKCalculator.calculate({
      ...UKCalculator.getDefaultInputs(),
      grossSalary: UKCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = UKCalculator.calculate({
      ...UKCalculator.getDefaultInputs(),
      grossSalary: UKCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

