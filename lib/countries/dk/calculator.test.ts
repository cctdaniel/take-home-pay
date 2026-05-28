// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { DKCalculator } from "./calculator";

describe("DK calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = DKCalculator.getDefaultInputs();
    const result = DKCalculator.calculate(inputs);
    expect(result.country).toBe("DK");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = DKCalculator.calculate({
      ...DKCalculator.getDefaultInputs(),
      grossSalary: DKCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = DKCalculator.calculate({
      ...DKCalculator.getDefaultInputs(),
      grossSalary: DKCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

