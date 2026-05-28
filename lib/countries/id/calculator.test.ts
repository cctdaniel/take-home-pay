// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { IDCalculator } from "./calculator";

describe("ID calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = IDCalculator.getDefaultInputs();
    const result = IDCalculator.calculate(inputs);
    expect(result.country).toBe("ID");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = IDCalculator.calculate({
      ...IDCalculator.getDefaultInputs(),
      grossSalary: IDCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = IDCalculator.calculate({
      ...IDCalculator.getDefaultInputs(),
      grossSalary: IDCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

