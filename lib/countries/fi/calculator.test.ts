// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { FICalculator } from "./calculator";

describe("FI calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = FICalculator.getDefaultInputs();
    const result = FICalculator.calculate(inputs);
    expect(result.country).toBe("FI");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = FICalculator.calculate({
      ...FICalculator.getDefaultInputs(),
      grossSalary: FICalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = FICalculator.calculate({
      ...FICalculator.getDefaultInputs(),
      grossSalary: FICalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

