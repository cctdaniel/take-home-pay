// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { AECalculator } from "./calculator";

describe("AE calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = AECalculator.getDefaultInputs();
    const result = AECalculator.calculate(inputs);
    expect(result.country).toBe("AE");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = AECalculator.calculate({
      ...AECalculator.getDefaultInputs(),
      grossSalary: AECalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = AECalculator.calculate({
      ...AECalculator.getDefaultInputs(),
      grossSalary: AECalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

